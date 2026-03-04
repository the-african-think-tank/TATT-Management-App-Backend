import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Chapter } from './entities/chapter.entity';
import { ChapterActivity, ActivityType } from './entities/chapter-activity.entity';
import { User } from '../iam/entities/user.entity';
import { Post, PostType } from '../feed/entities/post.entity';
import { PostLike } from '../feed/entities/post-like.entity';
import { PostComment } from '../feed/entities/post-comment.entity';
import { CreateChapterDto } from './dto/chapters.dto';
import { CreateChapterActivityDto, UpdateChapterActivityDto } from './dto/chapter-activity.dto';
import { SystemRole } from '../iam/enums/roles.enum';

const ACTIVITY_AUTHOR_ATTRS = ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'communityTier'] as const;
const POST_AUTHOR_ATTRS = ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'communityTier', 'tattMemberId'] as const;

@Injectable()
export class ChaptersService {
    constructor(
        @InjectModel(Chapter) private chapterRepository: typeof Chapter,
        @InjectModel(ChapterActivity) private activityRepository: typeof ChapterActivity,
        @InjectModel(User) private userRepository: typeof User,
        @InjectModel(Post) private postRepository: typeof Post,
        @InjectModel(PostLike) private likeRepository: typeof PostLike,
        @InjectModel(PostComment) private commentRepository: typeof PostComment,
    ) { }

    async createChapter(dto: CreateChapterDto) {
        const existingCode = await this.chapterRepository.findOne({ where: { code: dto.code } });
        if (existingCode) {
            throw new ConflictException(`Chapter with code ${dto.code} already exists.`);
        }
        const chapter = await this.chapterRepository.create({ ...dto });
        return { message: 'Chapter created successfully', data: chapter };
    }

    async getAllChapters() {
        return this.chapterRepository.findAll();
    }

    async getChapterById(id: string) {
        const chapter = await this.chapterRepository.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'regionalManager',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle'],
                },
            ],
        });
        if (!chapter) {
            throw new NotFoundException('Chapter not found');
        }
        return chapter;
    }

    async getChapterMembers(chapterId: string, _viewerId?: string) {
        await this.getChapterById(chapterId); // ensure chapter exists
        const [members, total] = await Promise.all([
            this.userRepository.findAll({
                where: { chapterId, isActive: true },
                attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'industry', 'communityTier'],
                limit: 50,
            }),
            this.userRepository.count({ where: { chapterId, isActive: true } }),
        ]);
        return { members, total };
    }

    async updateChapterManager(id: string, managerId: string) {
        const chapter = await this.getChapterById(id);
        chapter.regionalManagerId = managerId;
        await chapter.save();
        return { message: 'Regional manager updated successfully', data: chapter };
    }

    // ── CHAPTER ACTIVITIES (Admin-managed news/events/announcements) ─────────────

    async getChapterActivities(chapterId: string, page = 1, limit = 20) {
        await this.getChapterById(chapterId);
        const offset = (page - 1) * limit;
        const { count, rows } = await this.activityRepository.findAndCountAll({
            where: { chapterId, isPublished: true },
            include: [
                { model: User, as: 'author', attributes: [...ACTIVITY_AUTHOR_ATTRS] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        return {
            data: rows,
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        };
    }

    async createChapterActivity(chapterId: string, author: User, dto: CreateChapterActivityDto) {
        await this.getChapterById(chapterId);
        const isAdmin = [SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.REGIONAL_ADMIN].includes(author.systemRole);
        if (!isAdmin) {
            throw new ForbiddenException('Only chapter admins can post chapter activities.');
        }
        const { eventDate, ...rest } = dto;
        const activity = await this.activityRepository.create({
            chapterId,
            authorId: author.id,
            ...rest,
            eventDate: eventDate ? new Date(eventDate) : undefined,
            isPublished: true,
        });
        return { message: 'Chapter activity posted successfully.', activityId: activity.id };
    }

    async updateChapterActivity(activityId: string, author: User, dto: UpdateChapterActivityDto) {
        const activity = await this.activityRepository.findByPk(activityId);
        if (!activity) throw new NotFoundException('Activity not found.');
        const isAdmin = [SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.REGIONAL_ADMIN].includes(author.systemRole);
        const isOwner = activity.authorId === author.id;
        if (!isAdmin && !isOwner) throw new ForbiddenException('Unauthorised.');
        const { eventDate, ...rest } = dto;
        Object.assign(activity, rest);
        if (eventDate) activity.eventDate = new Date(eventDate);
        await activity.save();
        return { message: 'Activity updated.' };
    }

    async deleteChapterActivity(activityId: string, author: User) {
        const activity = await this.activityRepository.findByPk(activityId);
        if (!activity) throw new NotFoundException('Activity not found.');
        const isAdmin = [SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.REGIONAL_ADMIN].includes(author.systemRole);
        const isOwner = activity.authorId === author.id;
        if (!isAdmin && !isOwner) throw new ForbiddenException('Unauthorised.');
        await activity.destroy();
        return { message: 'Activity deleted.' };
    }

    // ── CHAPTER FEED (community member posts within this chapter) ─────────────────

    async getChapterFeed(chapterId: string, viewer: User, page = 1, limit = 20) {
        await this.getChapterById(chapterId);
        const offset = (page - 1) * limit;

        const { count, rows: posts } = await this.postRepository.findAndCountAll({
            where: { chapterId, isPublished: true },
            include: [
                { model: User, as: 'author', attributes: [...POST_AUTHOR_ATTRS] },
                {
                    model: PostLike, as: 'likes', attributes: ['userId'], required: false,
                },
                {
                    model: PostComment, as: 'comments', attributes: ['id'], required: false,
                    where: { parentId: null }, paranoid: false,
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        const postIds = posts.map(p => p.id);
        let likedSet = new Set<string>();
        if (postIds.length > 0) {
            const myLikes = await this.likeRepository.findAll({
                where: { userId: viewer.id, postId: { [Op.in]: postIds } },
                attributes: ['postId'],
            });
            likedSet = new Set(myLikes.map(l => l.postId));
        }

        const data = posts.map(p => ({
            id: p.id,
            type: p.type,
            title: p.title ?? null,
            content: p.content,
            contentFormat: p.contentFormat,
            mediaUrls: p.mediaUrls ?? [],
            tags: p.tags ?? [],
            author: p.author,
            likesCount: p.likes?.length ?? 0,
            commentsCount: p.comments?.length ?? 0,
            isLikedByMe: likedSet.has(p.id),
            createdAt: p.createdAt,
        }));

        return { data, meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) } };
    }
}
