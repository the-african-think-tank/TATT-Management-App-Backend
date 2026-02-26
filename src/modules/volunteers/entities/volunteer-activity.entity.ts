import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

export enum ActivityStatus {
    ASSIGNED = 'ASSIGNED',
    COMPLETED = 'COMPLETED',
    DECLINED = 'DECLINED',
    CANCELLED = 'CANCELLED',
}

@Table({
    tableName: 'volunteer_activities',
    timestamps: true,
})
export class VolunteerActivity extends Model<VolunteerActivity> {
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
    description: string;

    @ForeignKey(() => Chapter)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    chapterId: string;

    @BelongsTo(() => Chapter)
    chapter: Chapter;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    assignedToId: string;

    @BelongsTo(() => User, 'assignedToId')
    volunteer: User;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    dueDate: Date;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    estimatedHours: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 10, // Base impact points
    })
    impactPoints: number;

    @Column({
        type: DataType.ENUM(...Object.values(ActivityStatus)),
        defaultValue: ActivityStatus.ASSIGNED,
    })
    status: ActivityStatus;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declineReason?: string;
}
