import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Post } from './post.entity';

/**
 * Toggle-like junction between User and Post.
 * Composite PK (userId + postId) guarantees a single like per user per post.
 * Liking again deletes the row (unlike).
 */
@Table({
    tableName: 'post_likes',
    timestamps: true,
    updatedAt: false,
})
export class PostLike extends Model<PostLike> {
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, primaryKey: true })
    userId: string;

    @BelongsTo(() => User, 'userId')
    user: User;

    @ForeignKey(() => Post)
    @Column({ type: DataType.UUID, primaryKey: true })
    postId: string;

    @BelongsTo(() => Post, 'postId')
    post: Post;
}
