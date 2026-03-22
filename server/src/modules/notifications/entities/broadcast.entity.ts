import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { NotificationType } from './notification.entity';

export enum BroadcastAudience {
    ALL = 'ALL',
    ORG_MEMBERS = 'ORG_MEMBERS',
    TIER_SPECIFIC = 'TIER_SPECIFIC',
    CHAPTER_SPECIFIC = 'CHAPTER_SPECIFIC',
}

export enum BroadcastStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    SENT = 'SENT',
    CANCELLED = 'CANCELLED',
}

@Table({
    tableName: 'admin_broadcasts',
    timestamps: true,
})
export class Broadcast extends Model<Broadcast> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    message: string;

    @Column({
        type: DataType.ENUM(...Object.values(BroadcastAudience)),
        allowNull: false,
    })
    audienceType: BroadcastAudience;

    @Column({
        type: DataType.STRING, // e.g., 'UBUNTU', 'IMANI', 'KIONGOZI'
        allowNull: true,
    })
    targetTier?: string;

    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    targetChapterId?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    scheduledAt?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    sentAt?: Date;

    @Default(BroadcastStatus.DRAFT)
    @Column({
        type: DataType.ENUM(...Object.values(BroadcastStatus)),
        allowNull: false,
    })
    status: BroadcastStatus;

    @Column({
        type: DataType.ENUM(...Object.values(NotificationType)),
        allowNull: false,
        defaultValue: NotificationType.SYSTEM_ANNOUNCEMENT,
    })
    type: NotificationType;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    authorId: string;

    @BelongsTo(() => User)
    author: User;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    recipientCount: number;
}
