import {
    Table, Column, Model, DataType,
    ForeignKey, BelongsTo, HasMany,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Post } from './post.entity';

@Table({
    tableName: 'post_comments',
    timestamps: true,
    paranoid: true, // soft delete so comment counts don't break
})
export class PostComment extends Model<PostComment> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => Post)
    @Column({ type: DataType.UUID, allowNull: false })
    postId: string;

    @BelongsTo(() => Post, 'postId')
    post: Post;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    authorId: string;

    @BelongsTo(() => User, 'authorId')
    author: User;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    /**
     * Optional parent comment ID for one level of replies.
     * Top-level comments have parentId = null.
     * Only one level of nesting is supported for simplicity.
     */
    @ForeignKey(() => PostComment)
    @Column({ type: DataType.UUID, allowNull: true })
    parentId?: string;

    @BelongsTo(() => PostComment, 'parentId')
    parent: PostComment;

    /** One-level replies nested under this comment */
    @HasMany(() => PostComment, 'parentId')
    replies: PostComment[];
}
