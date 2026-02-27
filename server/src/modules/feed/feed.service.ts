import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as sanitizeHtml from 'sanitize-html';
import { Post, PostType, ContentFormat } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { CommunityTier, SystemRole } from '../iam/enums/roles.enum';
import {
    FeedQueryDto, FeedFilter,
    CreatePostDto, UpdatePostDto,
    AddCommentDto, GetCommentsQueryDto,
} from './dto/feed.dto';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Tiers that can see premium content in full */
const PAID_TIERS: CommunityTier[] = [
    CommunityTier.UBUNTU,
    CommunityTier.IMANI,
    CommunityTier.KIONGOZI,
];

/** Org roles that can always see all content and mark posts as premium */
const STAFF_ROLES: SystemRole[] = [
    SystemRole.SUPERADMIN,
    SystemRole.ADMIN,
    SystemRole.MODERATOR,
    SystemRole.CONTENT_ADMIN,
    SystemRole.REGIONAL_ADMIN,
];

/** Minimal author fields returned in feed card */
const AUTHOR_ATTRS = [
    'id', 'firstName', 'lastName', 'profilePicture',
    'professionTitle', 'communityTier', 'tattMemberId',
] as const;

const CHAPTER_ATTRS = ['id', 'name', 'code'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isStaff(user: User): boolean {
    return STAFF_ROLES.includes(user.systemRole);
}

function isPaidMember(user: User): boolean {
    return PAID_TIERS.includes(user.communityTier);
}

function canSeePremium(user: User): boolean {
    return isStaff(user) || isPaidMember(user);
}

function canCreatePremium(user: User): boolean {
    return isStaff(user) || isPaidMember(user);
}

/**
 * Allowed HTML elements and attributes for rich-text posts.
 * This allowlist is intentionally restrictive — no scripts, iframes, forms, etc.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        // Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // Inline formatting
        'b', 'i', 'em', 'strong', 'u', 's', 'del', 'mark', 'small', 'sub', 'sup',
        'code', 'kbd', 'pre', 'abbr', 'span',
        // Structure
        'p', 'br', 'hr', 'blockquote', 'div', 'section',
        // Lists
        'ul', 'ol', 'li',
        // Links
        'a',
        // Tables
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        // Media (no scripts)
        'img',
        // Figure
        'figure', 'figcaption',
    ],
    allowedAttributes: {
        'a': ['href', 'target', 'rel', 'title'],
        'img': ['src', 'alt', 'width', 'height', 'loading'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan'],
        'span': ['class'],
        'div': ['class'],
        'p': ['class'],
        'blockquote': ['class'],
        'pre': ['class'],
        'code': ['class'], // for syntax highlighter class hooks
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    // Force relative links to open in a new tab with safe attrs
    transformTags: {
        'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
};

/**
 * Sanitizes content when format is HTML; returns content as-is for PLAIN/MARKDOWN.
 * Also trims the result and rejects if blank after sanitization.
 */
function sanitizeContent(content: string, format: ContentFormat): string {
    if (format !== ContentFormat.HTML) return content;
    const clean = sanitizeHtml(content, SANITIZE_OPTIONS).trim();
    if (!clean) {
        throw new BadRequestException('HTML content was empty after sanitization. Please review your input.');
    }
    return clean;
}

/**
 * Strips or locks premium content based on viewer's plan.
 * Also attaches computed `isLikedByMe`, `likesCount`, `commentsCount`.
 */
function applyPremiumGate(post: Post, viewer: User, likedPostIds: Set<string>): Record<string, any> {
    const locked = post.isPremium && !canSeePremium(viewer);
    return {
        id: post.id,
        type: post.type,
        isPremium: post.isPremium,
        isPremiumLocked: locked,
        title: post.title ?? null,
        content: locked ? null : post.content,
        contentFormat: post.contentFormat,   // always exposed so the frontend knows what to expect
        mediaUrls: locked ? [] : (post.mediaUrls ?? []),
        tags: post.tags ?? [],
        author: post.author,
        chapter: post.chapter ?? null,
        likesCount: post.likes?.length ?? 0,
        commentsCount: post.comments?.length ?? 0,
        isLikedByMe: likedPostIds.has(post.id),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

@Injectable()
export class FeedService {
    private readonly logger = new Logger(FeedService.name);

    constructor(
        @InjectModel(Post) private postRepo: typeof Post,
        @InjectModel(PostLike) private likeRepo: typeof PostLike,
        @InjectModel(PostComment) private commentRepo: typeof PostComment,
        @InjectModel(User) private userRepo: typeof User,
    ) { }

    // ════════════════════════════════════════════════════════════════════════════
    //  FEED QUERIES
    // ════════════════════════════════════════════════════════════════════════════

    async getFeed(viewer: User, query: FeedQueryDto) {
        const { filter = FeedFilter.ALL, page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;

        // ── PREMIUM filter gate ───────────────────────────────────────────────
        if (filter === FeedFilter.PREMIUM && !canSeePremium(viewer)) {
            throw new ForbiddenException(
                'The Premium feed is exclusively available to paid TATT members (Ubuntu, Imani, or Kiongozi tier). ' +
                'Upgrade your membership to access curated premium resources.',
            );
        }

        // ── CHAPTER filter validation ─────────────────────────────────────────
        if (filter === FeedFilter.CHAPTER && !viewer.chapterId) {
            return {
                data: [],
                meta: { total: 0, page, limit, totalPages: 0 },
                message: 'You are not assigned to a chapter. Join a chapter to see local posts.',
            };
        }

        // ── Build WHERE clause ────────────────────────────────────────────────
        const where: Record<string, any> = { isPublished: true };

        if (filter === FeedFilter.CHAPTER) {
            where['chapterId'] = viewer.chapterId;
        }

        if (filter === FeedFilter.PREMIUM) {
            where['isPremium'] = true;
        }

        // ── Query posts ───────────────────────────────────────────────────────
        const { count, rows: posts } = await this.postRepo.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: [...AUTHOR_ATTRS],
                },
                {
                    model: Chapter,
                    as: 'chapter',
                    attributes: [...CHAPTER_ATTRS],
                    required: false,
                },
                {
                    model: PostLike,
                    as: 'likes',
                    attributes: ['userId'],
                    required: false,
                },
                {
                    model: PostComment,
                    as: 'comments',
                    attributes: ['id'],
                    required: false,
                    where: { parentId: null }, // only count top-level comments
                    paranoid: false, // include soft-deleted in count
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true, // required when using findAndCountAll with hasMany includes
        });

        // ── Build set of post IDs this viewer has liked ───────────────────────
        const postIds = posts.map((p) => p.id);
        let likedPostIds = new Set<string>();

        if (postIds.length > 0) {
            const myLikes = await this.likeRepo.findAll({
                where: { userId: viewer.id, postId: { [Op.in]: postIds } },
                attributes: ['postId'],
            });
            likedPostIds = new Set(myLikes.map((l) => l.postId));
        }

        // ── Apply premium gate and format response ────────────────────────────
        const data = posts.map((post) => applyPremiumGate(post, viewer, likedPostIds));

        return {
            data,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  SINGLE POST (with comments preview)
    // ════════════════════════════════════════════════════════════════════════════

    async getPost(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId, {
            include: [
                { model: User, as: 'author', attributes: [...AUTHOR_ATTRS] },
                { model: Chapter, as: 'chapter', attributes: [...CHAPTER_ATTRS], required: false },
                { model: PostLike, as: 'likes', attributes: ['userId'], required: false },
                {
                    model: PostComment,
                    as: 'comments',
                    attributes: ['id'],
                    required: false,
                    paranoid: false,
                },
            ],
        });

        if (!post || !post.isPublished) {
            throw new NotFoundException('Post not found.');
        }

        const myLike = await this.likeRepo.findOne({
            where: { userId: viewer.id, postId },
        });
        const likedPostIds = new Set<string>(myLike ? [postId] : []);

        return applyPremiumGate(post, viewer, likedPostIds);
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  CREATE POST
    // ════════════════════════════════════════════════════════════════════════════

    async createPost(author: User, dto: CreatePostDto) {
        // Restrict premium/announcement/resource post types
        if (dto.isPremium && !canCreatePremium(author)) {
            throw new ForbiddenException(
                'Only paid members (Ubuntu, Imani, Kiongozi) and org staff can create premium posts.',
            );
        }

        const restrictedTypes = [PostType.ANNOUNCEMENT, PostType.RESOURCE];
        if (restrictedTypes.includes(dto.type) && !isStaff(author)) {
            throw new ForbiddenException(
                `Only org staff can create ${dto.type} posts.`,
            );
        }

        // Load full author to get chapterId
        const fullAuthor = await this.userRepo.findByPk(author.id, {
            attributes: ['id', 'chapterId'],
        });

        const format = dto.contentFormat ?? ContentFormat.PLAIN;
        const sanitizedContent = sanitizeContent(dto.content, format);

        const post = await this.postRepo.create({
            authorId: author.id,
            type: dto.type ?? PostType.GENERAL,
            title: dto.title ?? null,
            content: sanitizedContent,
            contentFormat: format,
            mediaUrls: dto.mediaUrls ?? [],
            tags: dto.tags ?? [],
            isPremium: dto.isPremium ?? false,
            chapterId: fullAuthor?.chapterId ?? null,
            isPublished: true,
        });

        return { message: 'Post published successfully.', postId: post.id };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  UPDATE POST
    // ════════════════════════════════════════════════════════════════════════════

    async updatePost(viewer: User, postId: string, dto: UpdatePostDto) {
        const post = await this.postRepo.findByPk(postId);
        if (!post) throw new NotFoundException('Post not found.');

        const isOwner = post.authorId === viewer.id;
        const isModerator = isStaff(viewer);

        if (!isOwner && !isModerator) {
            throw new ForbiddenException('You can only edit your own posts.');
        }

        // Only staff can set isPremium
        if (dto.isPremium === true && !canCreatePremium(viewer)) {
            throw new ForbiddenException('Only paid members or org staff can mark posts as premium.');
        }

        // Sanitize content if provided
        const format = dto.contentFormat ?? post.contentFormat;
        const sanitizedContent =
            dto.content !== undefined
                ? sanitizeContent(dto.content, format)
                : undefined;

        Object.assign(post, {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(sanitizedContent !== undefined && { content: sanitizedContent }),
            ...(dto.contentFormat !== undefined && { contentFormat: dto.contentFormat }),
            ...(dto.mediaUrls !== undefined && { mediaUrls: dto.mediaUrls }),
            ...(dto.tags !== undefined && { tags: dto.tags }),
            ...(dto.isPremium !== undefined && { isPremium: dto.isPremium }),
            ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
        });

        await post.save();
        return { message: 'Post updated successfully.' };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  DELETE POST
    // ════════════════════════════════════════════════════════════════════════════

    async deletePost(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId);
        if (!post) throw new NotFoundException('Post not found.');

        const isOwner = post.authorId === viewer.id;
        const isModerator = isStaff(viewer);

        if (!isOwner && !isModerator) {
            throw new ForbiddenException('You can only delete your own posts.');
        }

        await post.destroy(); // soft delete
        return { message: 'Post removed from feed.' };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  TOGGLE LIKE
    // ════════════════════════════════════════════════════════════════════════════

    async toggleLike(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId, { attributes: ['id', 'isPublished', 'isPremium'] });
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');

        // Block free members from liking premium-locked posts they cannot see
        if (post.isPremium && !canSeePremium(viewer)) {
            throw new ForbiddenException(
                'Upgrade your membership to interact with premium posts.',
            );
        }

        const existing = await this.likeRepo.findOne({
            where: { userId: viewer.id, postId },
        });

        if (existing) {
            await existing.destroy();
            return { liked: false, message: 'Post unliked.' };
        }

        await this.likeRepo.create({ userId: viewer.id, postId });
        return { liked: true, message: 'Post liked.' };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  COMMENTS
    // ════════════════════════════════════════════════════════════════════════════

    async getComments(viewer: User, postId: string, query: GetCommentsQueryDto) {
        const post = await this.postRepo.findByPk(postId, { attributes: ['id', 'isPublished', 'isPremium'] });
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');

        // Free members cannot read comments on premium-locked posts
        if (post.isPremium && !canSeePremium(viewer)) {
            throw new ForbiddenException('Upgrade your membership to read comments on premium posts.');
        }

        const { page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;

        // Fetch top-level comments with nested replies
        const { count, rows } = await this.commentRepo.findAndCountAll({
            where: { postId, parentId: null },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: [...AUTHOR_ATTRS],
                },
                {
                    // Eager-load one level of replies
                    model: PostComment,
                    as: 'replies',
                    required: false,
                    where: { deletedAt: null },
                    include: [
                        { model: User, as: 'author', attributes: [...AUTHOR_ATTRS] },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        return {
            data: rows,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    async addComment(author: User, postId: string, dto: AddCommentDto) {
        const post = await this.postRepo.findByPk(postId, { attributes: ['id', 'isPublished', 'isPremium'] });
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');

        if (post.isPremium && !canSeePremium(author)) {
            throw new ForbiddenException('Upgrade your membership to comment on premium posts.');
        }

        if (dto.parentId) {
            const parent = await this.commentRepo.findByPk(dto.parentId);
            if (!parent || parent.postId !== postId) {
                throw new BadRequestException('Parent comment not found on this post.');
            }
            if (parent.parentId) {
                throw new BadRequestException('Only one level of comment replies is supported.');
            }
        }

        const comment = await this.commentRepo.create({
            postId,
            authorId: author.id,
            content: dto.content,
            parentId: dto.parentId ?? null,
        });

        return { message: 'Comment added.', commentId: comment.id };
    }

    async deleteComment(viewer: User, commentId: string) {
        const comment = await this.commentRepo.findByPk(commentId, {
            include: [{ model: Post, as: 'post', attributes: ['authorId'] }],
        });

        if (!comment) throw new NotFoundException('Comment not found.');

        const isCommentOwner = comment.authorId === viewer.id;
        const isPostOwner = comment.post?.authorId === viewer.id;
        const isModerator = isStaff(viewer);

        if (!isCommentOwner && !isPostOwner && !isModerator) {
            throw new ForbiddenException('You are not authorised to delete this comment.');
        }

        await comment.destroy();
        return { message: 'Comment removed.' };
    }
}
