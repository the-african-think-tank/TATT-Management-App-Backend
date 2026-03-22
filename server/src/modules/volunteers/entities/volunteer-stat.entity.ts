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

/** Shape persisted in the `certifications` JSONB column */
export interface VolunteerCertification {
    name: string;
    status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
    issuedAt?: string; // ISO date string
}

@Table({ tableName: 'volunteer_stats', timestamps: true })
export class VolunteerStat extends Model<VolunteerStat> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false, unique: true })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    // ── Performance ──────────────────────────────────────────────────────────

    @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
    totalHours: number;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    impactPoints: number;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    eventsCompleted: number;

    /** Attendance rate 0–100 */
    @Column({ type: DataType.DECIMAL(5, 2), defaultValue: 100 })
    attendanceRate: number;

    /** Chapter rank position (e.g. 3 means #3 in that chapter) */
    @Column({ type: DataType.INTEGER, allowNull: true })
    chapterRank: number;

    /** Total volunteers in the chapter at time of last rank update */
    @Column({ type: DataType.INTEGER, allowNull: true })
    chapterTotal: number;

    /** Rolling average computed from VolunteerFeedback rows */
    @Column({ type: DataType.DECIMAL(2, 1), defaultValue: 5.0 })
    rating: number;

    /** Number of reviews contributing to the rating */
    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    ratingCount: number;

    @Column({ type: DataType.ENUM(...Object.values(VolunteerGrade)), defaultValue: VolunteerGrade.SILVER })
    grade: VolunteerGrade;

    @Column({ type: DataType.ENUM(...Object.values(VolunteerStatus)), defaultValue: VolunteerStatus.TRAINING })
    status: VolunteerStatus;

    // ── Certifications ───────────────────────────────────────────────────────

    /**
     * Array of certification objects, e.g.:
     * [{ name: "First Aid & CPR", status: "VERIFIED", issuedAt: "2024-01-15" }]
     */
    @Column({ type: DataType.JSONB, defaultValue: [] })
    certifications: VolunteerCertification[];

    // ── Contact ──────────────────────────────────────────────────────────────

    @Column({ type: DataType.STRING, allowNull: true })
    phone: string;

    /** Comma-separated ISO 639-1 language codes or plain names */
    @Column({ type: DataType.STRING, allowNull: true })
    languages: string;

    @Column({ type: DataType.STRING, allowNull: true })
    emergencyContactName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    emergencyContactRelation: string;

    @Column({ type: DataType.STRING, allowNull: true })
    emergencyContactPhone: string;

    // ── Admin ────────────────────────────────────────────────────────────────

    /** Private internal notes stored by admins */
    @Column({ type: DataType.TEXT, allowNull: true })
    adminNotes: string;
}
