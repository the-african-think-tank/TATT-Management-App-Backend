import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';
import { VolunteerApplication } from './volunteer-application.entity';

@Table({
    tableName: 'volunteer_roles',
    timestamps: true,
    paranoid: true,
})
export class VolunteerRole extends Model<VolunteerRole> {
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
    name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    location: string;

    @ForeignKey(() => Chapter)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    chapterId: string;

    @BelongsTo(() => Chapter)
    chapter: Chapter;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    weeklyHours: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    durationMonths: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        defaultValue: [],
    })
    responsibilities: string[];

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        defaultValue: [],
    })
    requiredSkills: string[];

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    spotsNeeded: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    openUntil: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isActive: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'Contributor',
    })
    grade: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    createdBy: string;

    @BelongsTo(() => User, 'createdBy')
    creator: User;

    @HasMany(() => VolunteerApplication)
    applications: VolunteerApplication[];
}
