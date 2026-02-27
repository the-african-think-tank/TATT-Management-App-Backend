import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { VolunteerRole } from './volunteer-role.entity';

export enum ApplicationStatus {
    PENDING = 'PENDING',
    INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
}

@Table({
    tableName: 'volunteer_applications',
    timestamps: true,
})
export class VolunteerApplication extends Model<VolunteerApplication> {
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

    @ForeignKey(() => VolunteerRole)
    @Column({
        type: DataType.UUID,
        allowNull: true, // Null for general application
    })
    roleId?: string;

    @BelongsTo(() => VolunteerRole)
    role?: VolunteerRole;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        defaultValue: [],
    })
    interestsAndSkills: string[];

    @Column({
        type: DataType.JSONB,
        allowNull: false,
    })
    weeklyAvailability: any; // e.g., { monday: ['09:00-12:00'], ... }

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    hoursAvailablePerWeek: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    reasonForApplying: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    questionsForAdmin?: string;

    @Column({
        type: DataType.ENUM(...Object.values(ApplicationStatus)),
        defaultValue: ApplicationStatus.PENDING,
    })
    status: ApplicationStatus;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    interviewTime?: Date;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    adminNotes?: string;
}
