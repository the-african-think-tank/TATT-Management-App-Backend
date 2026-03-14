import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

export enum VolunteerGrade {
    SILVER = 'SILVER',
    BRONZE = 'BRONZE',
    GOLD = 'GOLD',
}

export enum VolunteerStatus {
    ACTIVE = 'ACTIVE',
    TRAINING = 'TRAINING',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

@Table({
    tableName: 'volunteer_stats',
    timestamps: true,
})
export class VolunteerStat extends Model<VolunteerStat> {
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
        unique: true,
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0,
    })
    totalHours: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    impactPoints: number;

    @Column({
        type: DataType.ENUM(...Object.values(VolunteerGrade)),
        defaultValue: VolunteerGrade.SILVER,
    })
    grade: VolunteerGrade;

    @Column({
        type: DataType.ENUM(...Object.values(VolunteerStatus)),
        defaultValue: VolunteerStatus.TRAINING,
    })
    status: VolunteerStatus;

    @Column({
        type: DataType.DECIMAL(2, 1),
        defaultValue: 5.0,
    })
    rating: number;
}
