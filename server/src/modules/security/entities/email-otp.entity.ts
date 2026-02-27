import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

/**
 * Stores short-lived email OTP codes for 2FA.
 * Each entry is single-use — it is deleted on successful verification.
 * Double-hashed with bcrypt so even a DB breach cannot replay codes.
 */
@Table({
    tableName: 'email_otps',
    timestamps: true,
    updatedAt: false,
})
export class EmailOtp extends Model<EmailOtp> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    /** bcrypt hash of the 6-digit OTP */
    @Column({ type: DataType.STRING, allowNull: false })
    otpHash: string;

    /** When this OTP expires (10 minutes from creation) */
    @Column({ type: DataType.DATE, allowNull: false })
    expiresAt: Date;

    /**
     * IP address the OTP was generated for.
     * We warn (but do not block) if the verification IP differs — mitigates
     * phishing-relay attacks while still being usable on mobile networks.
     */
    @Column({ type: DataType.STRING, allowNull: true })
    issuedToIp: string | null;

    /** Rate-limit: how many failed attempts have been made against this OTP */
    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    failedAttempts: number;
}
