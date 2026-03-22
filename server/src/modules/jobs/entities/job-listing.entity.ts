import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { JobApplication } from './job-application.entity';
import { User } from '../../iam/entities/user.entity';

@Table({
    tableName: 'job_listings',
    timestamps: true,
    paranoid: true,
})
export class JobListing extends Model<JobListing> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.STRING, allowNull: false })
    companyName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    companyLogoUrl?: string;

    @Column({ type: DataType.STRING, allowNull: false })
    location: string;

    @Column({ type: DataType.STRING, allowNull: true })
    salaryLabel?: string;

    @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
    salaryMin?: number;

    @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
    salaryMax?: number;

    @Column({ type: DataType.STRING, allowNull: false })
    type: string; // Full-time, Part-time, Contract, etc.

    @Column({ type: DataType.STRING, allowNull: false })
    category: string; // Green Energy, FinTech, Sustainability, etc.

    @Column({ type: DataType.TEXT, allowNull: true })
    description?: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    requirements?: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    qualifications?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    companyWebsite?: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isNew: boolean;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isActive: boolean;

    // ─── MODERATION ───────────────────────────────────────────────────────────
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isFlagged: boolean;

    @Column({ type: DataType.TEXT, allowNull: true })
    flagReason?: string;

    // ─── POSTER TRACKING ─────────────────────────────────────────────────────
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    postedById?: string;

    @BelongsTo(() => User, 'postedById')
    postedBy?: User;

    @HasMany(() => JobApplication)
    applications: JobApplication[];
}
