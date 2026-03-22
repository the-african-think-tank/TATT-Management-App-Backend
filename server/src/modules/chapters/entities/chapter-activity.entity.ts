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
    COMMUNITY_OUTREACH = 'COMMUNITY_OUTREACH',
    PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
    FUNDRAISING = 'FUNDRAISING',
    RESEARCH_POLICY = 'RESEARCH_POLICY',
    INTERNAL_WORKSHOP = 'INTERNAL_WORKSHOP',
}

export enum LocationType {
    PHYSICAL = 'PHYSICAL',
    VIRTUAL = 'VIRTUAL',
}

export enum ActivityVisibility {
    VOLUNTEERS_ONLY = 'VOLUNTEERS_ONLY',
    CHAPTER_WIDE = 'CHAPTER_WIDE',
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

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    volunteerManagerId?: string;

    @BelongsTo(() => User, 'volunteerManagerId')
    volunteerManager?: User;

    @Default(ActivityType.ANNOUNCEMENT)
    @Column({ type: DataType.ENUM(...Object.values(ActivityType)), allowNull: false })
    type: ActivityType;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @Column({ type: DataType.STRING, allowNull: true })
    imageUrl?: string;

    /** For EVENT type: the start date & time */
    @Column({ type: DataType.DATE, allowNull: true })
    eventDate?: Date;

    /** For EVENT type: the end date & time */
    @Column({ type: DataType.DATE, allowNull: true })
    endDate?: Date;

    @Default(LocationType.PHYSICAL)
    @Column({ type: DataType.ENUM(...Object.values(LocationType)), allowNull: true })
    locationType?: LocationType;

    /** For EVENT type: the event location or meeting link */
    @Column({ type: DataType.STRING, allowNull: true })
    eventLocation?: string;

    @Column({ type: DataType.INTEGER, allowNull: true })
    targetVolunteers?: number;

    @Default(ActivityVisibility.CHAPTER_WIDE)
    @Column({ type: DataType.ENUM(...Object.values(ActivityVisibility)), allowNull: false })
    visibility: ActivityVisibility;

    @Column({ type: DataType.JSONB, allowNull: true })
    rolesNeeded?: any[]; // e.g., [{ title: 'Coordinator', description: '...' }]

    @Default(true)
    @Column(DataType.BOOLEAN)
    isPublished: boolean;
}
