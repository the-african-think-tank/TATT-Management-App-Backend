import {
    Table, Column, Model, DataType,
    ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Post } from './post.entity';

@Table({
    tableName: 'post_upvotes',
    timestamps: true,
})
export class PostUpvote extends Model<PostUpvote> {
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
