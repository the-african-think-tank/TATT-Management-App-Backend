/**
 * Swagger response schema classes for the TATT Feed domain.
 * These are pure documentation artefacts — they have no runtime role.
 * Used via @ApiResponse({ type: PostCardSchema }) to give Swagger full model visibility.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

export class PostAuthorSchema {
    @ApiProperty({ example: 'b2c9f1a0-4e8d-4f71-bf14-01e23f4a5678', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Jane' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'https://cdn.tatt.org/avatars/jane.jpg', nullable: true })
    profilePicture: string | null;

    @ApiProperty({ example: 'Senior Strategy Consultant', nullable: true })
    professionTitle: string | null;

    @ApiProperty({ example: 'UBUNTU', enum: ['FREE', 'UBUNTU', 'IMANI', 'KIONGOZI'] })
    communityTier: string;

    @ApiProperty({ example: 'TATT-NBO-0042' })
    tattMemberId: string;
}

export class PostChapterSchema {
    @ApiProperty({ example: 'a1b2c3d4-...', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Nairobi Chapter' })
    name: string;

    @ApiProperty({ example: 'NBO' })
    code: string;
}

// ─── Feed post card (returned in feed list and single-post view) ───────────────

export class PostCardSchema {
    @ApiProperty({ example: 'c3d4e5f6-0001-...', format: 'uuid' })
    id: string;

    @ApiProperty({
        enum: ['GENERAL', 'RESOURCE', 'EVENT', 'ANNOUNCEMENT'],
        example: 'GENERAL',
        description: 'Post type.',
    })
    type: string;

    @ApiProperty({
        example: false,
        description: 'Whether this post is marked as premium content.',
    })
    isPremium: boolean;

    @ApiProperty({
        example: false,
        description:
            'True when the post is premium AND the requesting user is a Free-tier member. ' +
            'Frontend should render an upgrade prompt instead of the content.',
    })
    isPremiumLocked: boolean;

    @ApiPropertyOptional({
        example: 'Building a Pan-African Investment Thesis',
        nullable: true,
        description: 'Optional post title.',
    })
    title: string | null;

    @ApiProperty({
        example: '<h2>Pan-African Investment</h2><p>Here are the <strong>three pillars</strong>...</p>',
        nullable: true,
        description: 'Post body. null when isPremiumLocked = true.',
    })
    content: string | null;

    @ApiProperty({
        enum: ['PLAIN', 'MARKDOWN', 'HTML'],
        example: 'HTML',
        description:
            'Tells the frontend how to render `content`. ' +
            'HTML content is guaranteed XSS-safe (sanitized server-side).',
    })
    contentFormat: string;

    @ApiProperty({
        type: [String],
        example: ['https://cdn.tatt.org/posts/img1.jpg'],
        description: 'Empty array when isPremiumLocked = true.',
    })
    mediaUrls: string[];

    @ApiProperty({ type: [String], example: ['fintech', 'africa', 'investment'] })
    tags: string[];

    @ApiProperty({ type: () => PostAuthorSchema })
    author: PostAuthorSchema;

    @ApiProperty({ type: () => PostChapterSchema, nullable: true })
    chapter: PostChapterSchema | null;

    @ApiProperty({ example: 42, description: 'Total number of likes on this post.' })
    likesCount: number;

    @ApiProperty({ example: 7, description: 'Total number of top-level comments.' })
    commentsCount: number;

    @ApiProperty({
        example: true,
        description: 'Whether the requesting user has already liked this post.',
    })
    isLikedByMe: boolean;

    @ApiProperty({ example: '2026-02-22T18:00:00.000Z', format: 'date-time' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-22T19:30:00.000Z', format: 'date-time' })
    updatedAt: string;
}

// ─── Feed paginated response wrapper ─────────────────────────────────────────

export class FeedMetaSchema {
    @ApiProperty({ example: 150 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 20 })
    limit: number;

    @ApiProperty({ example: 8 })
    totalPages: number;
}

export class FeedResponseSchema {
    @ApiProperty({ type: [PostCardSchema] })
    data: PostCardSchema[];

    @ApiProperty({ type: () => FeedMetaSchema })
    meta: FeedMetaSchema;
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export class ToggleLikeResponseSchema {
    @ApiProperty({
        example: true,
        description: '`true` = post was liked, `false` = post was unliked (toggle).',
    })
    liked: boolean;

    @ApiProperty({ example: 'Post liked.' })
    message: string;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export class CommentAuthorSchema {
    @ApiProperty({ example: 'b2c9f1a0-...', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Jane' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'https://cdn.tatt.org/avatars/jane.jpg', nullable: true })
    profilePicture: string | null;

    @ApiProperty({ example: 'Senior Consultant', nullable: true })
    professionTitle: string | null;
}

export class CommentReplySchema {
    @ApiProperty({ example: 'r1s2t3u4-...', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'c3d4e5f6-...', format: 'uuid', description: 'ID of the parent comment.' })
    parentId: string;

    @ApiProperty({ example: 'Totally agree with this point!' })
    content: string;

    @ApiProperty({ type: () => CommentAuthorSchema })
    author: CommentAuthorSchema;

    @ApiProperty({ example: '2026-02-22T19:00:00.000Z', format: 'date-time' })
    createdAt: string;
}

export class CommentSchema {
    @ApiProperty({ example: 'c3d4e5f6-0001-...', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'a1b2c3d4-...', format: 'uuid', description: 'Post this comment belongs to.' })
    postId: string;

    @ApiProperty({ nullable: true, example: null, description: 'null for top-level comments.' })
    parentId: string | null;

    @ApiProperty({ example: 'This is a really insightful perspective — thanks for sharing!' })
    content: string;

    @ApiProperty({ type: () => CommentAuthorSchema })
    author: CommentAuthorSchema;

    @ApiProperty({
        type: [CommentReplySchema],
        description: 'One-level replies nested under this comment.',
    })
    replies: CommentReplySchema[];

    @ApiProperty({ example: '2026-02-22T18:30:00.000Z', format: 'date-time' })
    createdAt: string;
}

export class CommentsResponseSchema {
    @ApiProperty({ type: [CommentSchema] })
    data: CommentSchema[];

    @ApiProperty({ type: () => FeedMetaSchema })
    meta: FeedMetaSchema;
}

// ─── Create/mutate responses ──────────────────────────────────────────────────

export class CreatePostResponseSchema {
    @ApiProperty({ example: 'Post published successfully.' })
    message: string;

    @ApiProperty({ example: 'c3d4e5f6-0001-...', format: 'uuid' })
    postId: string;
}

export class CreateCommentResponseSchema {
    @ApiProperty({ example: 'Comment added.' })
    message: string;

    @ApiProperty({ example: 'r1s2t3u4-0001-...', format: 'uuid' })
    commentId: string;
}

export class MessageResponseSchema {
    @ApiProperty({ example: 'Post updated successfully.' })
    message: string;
}
