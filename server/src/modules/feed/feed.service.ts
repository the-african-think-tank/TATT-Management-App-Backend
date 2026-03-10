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
import { PostUpvote } from './entities/post-upvote.entity';
import { PostBookmark } from './entities/post-bookmark.entity';
import { PostReport } from './entities/post-report.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { CommunityTier, SystemRole } from '../iam/enums/roles.enum';
import {
    FeedQueryDto, FeedFilter,
    CreatePostDto, UpdatePostDto,
    AddCommentDto, GetCommentsQueryDto,
    ReportPostDto,
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

/**
 * Allowed HTML elements and attributes for rich-text posts.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'b', 'i', 'em', 'strong', 'u', 's', 'del', 'mark', 'small', 'sub', 'sup',
        'code', 'kbd', 'pre', 'abbr', 'span',
        'p', 'br', 'hr', 'blockquote', 'div', 'section',
        'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'img', 'figure', 'figcaption',
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
        'code': ['class'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: {
        'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isStaff(user?: User): boolean {
    return user ? STAFF_ROLES.includes(user.systemRole) : false;
}

function isPaidMember(user?: User): boolean {
    return user ? PAID_TIERS.includes(user.communityTier) : false;
}

function canSeePremium(user?: User): boolean {
    return isStaff(user) || isPaidMember(user);
}

function canCreatePremium(user?: User): boolean {
    return isStaff(user) || isPaidMember(user);
}

/**
 * Sanitizes content when format is HTML; returns content as-is for PLAIN/MARKDOWN.
 */
function sanitizeContent(content: string, format: ContentFormat): string {
    if (format !== ContentFormat.HTML) return content;
    const clean = sanitizeHtml(content, SANITIZE_OPTIONS).trim();
    if (!clean) {
        throw new BadRequestException('HTML content was empty after sanitization.');
    }
    return clean;
}

/**
 * Strips or locks premium content based on viewer's plan.
 */
function applyPremiumGate(
    post: Post, 
    viewer: User | undefined, 
    likedPostIds: Set<string>,
    upvotedPostIds: Set<string>,
    bookmarkedPostIds: Set<string>
): Record<string, any> {
    const locked = post.isPremium && !canSeePremium(viewer);
    return {
        id: post.id,
        type: post.type,
        isPremium: post.isPremium,
        isPremiumLocked: locked,
        title: post.title ?? null,
        content: locked ? null : post.content,
        contentFormat: post.contentFormat,
        mediaUrls: locked ? [] : (post.mediaUrls ?? []),
        tags: post.tags ?? [],
        author: post.author,
        chapter: post.chapter ?? null,
        likesCount: post.likes?.length ?? 0,
        upvotesCount: post.upvotes?.length ?? 0,
        commentsCount: post.comments?.length ?? 0,
        isLikedByMe: likedPostIds.has(post.id),
        isUpvotedByMe: upvotedPostIds.has(post.id),
        isBookmarked: bookmarkedPostIds.has(post.id),
        parentPost: post.parentPost ? applyPremiumGate(post.parentPost, viewer, new Set(), new Set(), new Set()) : null,
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
        @InjectModel(PostUpvote) private upvoteRepo: typeof PostUpvote,
        @InjectModel(PostBookmark) private bookmarkRepo: typeof PostBookmark,
        @InjectModel(PostReport) private reportRepo: typeof PostReport,
        @InjectModel(User) private userRepo: typeof User,
    ) { }

    // ════════════════════════════════════════════════════════════════════════════
    //  FEED QUERIES
    // ════════════════════════════════════════════════════════════════════════════

    async getFeed(viewer: User, query: FeedQueryDto) {
        const { filter = FeedFilter.ALL, page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;

        if (filter === FeedFilter.PREMIUM && !canSeePremium(viewer)) {
            throw new ForbiddenException('Upgrade your membership to access curated premium resources.');
        }

        if (filter === FeedFilter.CHAPTER && !viewer.chapterId) {
            return {
                data: [],
                meta: { total: 0, page, limit, totalPages: 0 },
                message: 'You are not assigned to a chapter.',
            };
        }

        const where: Record<string, any> = { isPublished: true };

        if (filter === FeedFilter.CHAPTER) {
            where['chapterId'] = viewer.chapterId;
        }

        if (filter === FeedFilter.PREMIUM) {
            where['isPremium'] = true;
        }

        const include: any[] = [
            { model: User, as: 'author', attributes: [...AUTHOR_ATTRS] },
            { model: Chapter, as: 'chapter', attributes: [...CHAPTER_ATTRS], required: false },
            { model: PostLike, as: 'likes', attributes: ['userId'], required: false },
            { model: PostUpvote, as: 'upvotes', attributes: ['userId'], required: false },
            { model: PostComment, as: 'comments', attributes: ['id'], required: false, where: { parentId: null }, paranoid: false },
            { 
                model: Post, 
                as: 'parentPost', 
                required: false,
                include: [{ model: User, as: 'author', attributes: [...AUTHOR_ATTRS] }]
            }
        ];

        // ── BOOKMARKS filter logic ───────────────────────────────────────────
        if (filter === FeedFilter.BOOKMARKS) {
            include.push({
                model: PostBookmark,
                as: 'bookmarks',
                where: { userId: viewer.id },
                required: true, // only posts that HAVE a bookmark from this user
            });
        } else {
            include.push({
                model: PostBookmark,
                as: 'bookmarks',
                attributes: ['userId'],
                required: false,
            });
        }

        const { count, rows: posts } = await this.postRepo.findAndCountAll({
            where,
            include,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        const postIds = posts.map((p) => p.id);
        let likedPostIds = new Set<string>();
        let upvotedPostIds = new Set<string>();
        let bookmarkedPostIds = new Set<string>();

        if (postIds.length > 0) {
            const [likes, upvotes, bookmarks] = await Promise.all([
                this.likeRepo.findAll({ where: { userId: viewer.id, postId: { [Op.in]: postIds } }, attributes: ['postId'] }),
                this.upvoteRepo.findAll({ where: { userId: viewer.id, postId: { [Op.in]: postIds } }, attributes: ['postId'] }),
                this.bookmarkRepo.findAll({ where: { userId: viewer.id, postId: { [Op.in]: postIds } }, attributes: ['postId'] }),
            ]);
            likedPostIds = new Set(likes.map((l) => l.postId));
            upvotedPostIds = new Set(upvotes.map((u) => u.postId));
            bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));
        }

        const data = posts.map((post) => applyPremiumGate(post, viewer, likedPostIds, upvotedPostIds, bookmarkedPostIds));

        return {
            data,
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        };
    }

    async getPost(viewer: User | undefined, postId: string) {
        const post = await this.postRepo.findByPk(postId, {
            include: [
                { model: User, as: 'author', attributes: [...AUTHOR_ATTRS] },
                { model: Chapter, as: 'chapter', attributes: [...CHAPTER_ATTRS], required: false },
                { model: PostLike, as: 'likes', attributes: ['userId'], required: false },
                { model: PostUpvote, as: 'upvotes', attributes: ['userId'], required: false },
                { model: PostBookmark, as: 'bookmarks', attributes: ['userId'], required: false },
                { model: PostComment, as: 'comments', attributes: ['id'], required: false, paranoid: false },
                { model: Post, as: 'parentPost', required: false, include: [{ model: User, as: 'author', attributes: [...AUTHOR_ATTRS] }] }
            ],
        });

        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');

        let liked = false, upvoted = false, bookmarked = false;
        if (viewer) {
            const [l, u, b] = await Promise.all([
                this.likeRepo.findOne({ where: { userId: viewer.id, postId } }),
                this.upvoteRepo.findOne({ where: { userId: viewer.id, postId } }),
                this.bookmarkRepo.findOne({ where: { userId: viewer.id, postId } }),
            ]);
            liked = !!l; upvoted = !!u; bookmarked = !!b;
        }

        return applyPremiumGate(
            post, viewer, 
            new Set(liked ? [postId] : []), 
            new Set(upvoted ? [postId] : []), 
            new Set(bookmarked ? [postId] : [])
        );
    }

    async createPost(author: User, dto: CreatePostDto) {
        if (dto.isPremium && !canCreatePremium(author)) {
            throw new ForbiddenException('Only paid members and staff can create premium posts.');
        }

        const restrictedTypes = [PostType.ANNOUNCEMENT, PostType.RESOURCE];
        if (restrictedTypes.includes(dto.type) && !isStaff(author)) {
            throw new ForbiddenException(`Only staff can create ${dto.type} posts.`);
        }

        const fullAuthor = await this.userRepo.findByPk(author.id, { attributes: ['id', 'chapterId'] });
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
            parentPostId: dto.parentPostId ?? null,
        });

        return { message: 'Post published successfully.', postId: post.id };
    }

    async updatePost(viewer: User, postId: string, dto: UpdatePostDto) {
        const post = await this.postRepo.findByPk(postId);
        if (!post) throw new NotFoundException('Post not found.');

        const isOwner = post.authorId === viewer.id;
        if (!isOwner && !isStaff(viewer)) throw new ForbiddenException('Not authorised.');

        if (dto.isPremium === true && !canCreatePremium(viewer)) {
            throw new ForbiddenException('Not authorised to mark as premium.');
        }

        const format = dto.contentFormat ?? post.contentFormat;
        const sanitizedContent = dto.content !== undefined ? sanitizeContent(dto.content, format) : undefined;

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
        return { message: 'Post updated.' };
    }

    async deletePost(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId);
        if (!post) throw new NotFoundException('Post not found.');
        if (post.authorId !== viewer.id && !isStaff(viewer)) throw new ForbiddenException('Not authorised.');
        await post.destroy();
        return { message: 'Post removed.' };
    }

    async toggleLike(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId);
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');
        if (post.authorId === viewer.id) throw new BadRequestException('You cannot like your own post.');

        if (post.isPremium && !canSeePremium(viewer)) throw new ForbiddenException('Upgrade required.');

        const existing = await this.likeRepo.findOne({ where: { userId: viewer.id, postId } });
        if (existing) { await existing.destroy(); return { liked: false, message: 'Post unliked.' }; }

        await this.likeRepo.create({ userId: viewer.id, postId });
        return { liked: true, message: 'Post liked.' };
    }

    async toggleUpvote(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId);
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');
        if (post.authorId === viewer.id) throw new BadRequestException('You cannot upvote your own post.');

        const existing = await this.upvoteRepo.findOne({ where: { userId: viewer.id, postId } });
        if (existing) { await existing.destroy(); return { upvoted: false }; }

        await this.upvoteRepo.create({ userId: viewer.id, postId });
        return { upvoted: true };
    }

    async toggleBookmark(viewer: User, postId: string) {
        const post = await this.postRepo.findByPk(postId);
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');

        const existing = await this.bookmarkRepo.findOne({ where: { userId: viewer.id, postId } });
        if (existing) { await existing.destroy(); return { bookmarked: false, message: 'Bookmark removed.' }; }

        await this.bookmarkRepo.create({ userId: viewer.id, postId });
        return { bookmarked: true, message: 'Post bookmarked.' };
    }

    async reportPost(reporter: User, postId: string, dto: any) {
        const post = await this.postRepo.findByPk(postId);
        if (!post) throw new NotFoundException('Post not found.');

        await this.reportRepo.create({
            postId,
            reporterId: reporter.id,
            reason: dto.reason,
            suggestedAction: dto.suggestedAction,
        });

        return { message: 'Report submitted.' };
    }

    async getComments(viewer: User, postId: string, query: GetCommentsQueryDto) {
        const post = await this.postRepo.findByPk(postId, { attributes: ['id', 'isPublished', 'isPremium'] });
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');
        if (post.isPremium && !canSeePremium(viewer)) throw new ForbiddenException('Upgrade required.');

        const { page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;

        const { count, rows } = await this.commentRepo.findAndCountAll({
            where: { postId, parentId: null },
            include: [
                { model: User, as: 'author', attributes: [...AUTHOR_ATTRS] },
                { model: PostComment, as: 'replies', required: false, where: { deletedAt: null }, include: [{ model: User, as: 'author', attributes: [...AUTHOR_ATTRS] }] },
            ],
            order: [['createdAt', 'DESC']],
            limit, offset, distinct: true,
        });

        return { data: rows, meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) } };
    }

    async addComment(author: User, postId: string, dto: AddCommentDto) {
        const post = await this.postRepo.findByPk(postId);
        if (!post || !post.isPublished) throw new NotFoundException('Post not found.');
        if (post.authorId === author.id) throw new BadRequestException('You cannot comment on your own post.');

        if (post.isPremium && !canSeePremium(author)) throw new ForbiddenException('Upgrade required.');

        const comment = await this.commentRepo.create({ postId, authorId: author.id, content: dto.content, parentId: dto.parentId ?? null });
        return { message: 'Comment added.', commentId: comment.id };
    }

    async deleteComment(viewer: User, commentId: string) {
        const comment = await this.commentRepo.findByPk(commentId, { include: [{ model: Post, as: 'post', attributes: ['authorId'] }] });
        if (!comment) throw new NotFoundException('Comment not found.');
        if (comment.authorId !== viewer.id && comment.post?.authorId !== viewer.id && !isStaff(viewer)) throw new ForbiddenException('Not authorised.');
        await comment.destroy();
        return { message: 'Comment removed.' };
    }
}
