import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './post.entity';

@Table({ tableName: 'feed_topics', timestamps: true })
export class FeedTopic extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    name: string;

    @Column({ type: DataType.STRING, allowNull: true })
    description: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isArchived: boolean;

    @HasMany(() => Post)
    posts: Post[];
}
