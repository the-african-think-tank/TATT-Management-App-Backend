import {
    Table, Column, Model, DataType, Default,
    ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Chapter } from './chapter.entity';

export enum ActivityType {
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    EVENT = 'EVENT',
    INITIATIVE = 'INITIATIVE',
    NEWS = 'NEWS',
}

@Table({
    tableName: 'chapter_activities',
    timestamps: true,
    paranoid: true,
})
export class ChapterActivity extends Model<ChapterActivity> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @ForeignKey(() => Chapter)
    @Column({ type: DataType.UUID, allowNull: false })
    chapterId: string;

    @BelongsTo(() => Chapter, 'chapterId')
    chapter: Chapter;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    authorId: string;

    @BelongsTo(() => User, 'authorId')
    author: User;

    @Default(ActivityType.ANNOUNCEMENT)
    @Column({ type: DataType.ENUM(...Object.values(ActivityType)), allowNull: false })
    type: ActivityType;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @Column({ type: DataType.STRING, allowNull: true })
    imageUrl?: string;

    /** For EVENT type: the event date */
    @Column({ type: DataType.DATE, allowNull: true })
    eventDate?: Date;

    /** For EVENT type: the event location */
    @Column({ type: DataType.STRING, allowNull: true })
    eventLocation?: string;

    @Default(true)
    @Column(DataType.BOOLEAN)
    isPublished: boolean;
}
