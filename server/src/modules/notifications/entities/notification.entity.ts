import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

export enum NotificationType {
    CONNECTION_REQUEST = 'CONNECTION_REQUEST',
    CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
    NEW_MESSAGE = 'NEW_MESSAGE',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
    SUBSCRIPTION_DOWNGRADE = 'SUBSCRIPTION_DOWNGRADE',
    EVENT_REMINDER = 'EVENT_REMINDER',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    ACCOUNT = 'ACCOUNT',
}

@Table({
    tableName: 'notifications',
    timestamps: true,
    paranoid: true,
})
export class Notification extends Model<Notification> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataType.ENUM(...Object.values(NotificationType)),
        allowNull: false,
    })
    type: NotificationType;

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
        type: DataType.JSONB,
        allowNull: true,
    })
    data?: any;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    readAt?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    dismissedAt?: Date;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isEmailSent: boolean;
}
