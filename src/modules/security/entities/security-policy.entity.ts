import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

/**
 * TwoFactorScope controls which user groups the 2FA mandate applies to.
 * DISABLED = no enforcement (users may still self-opt-in)
 * OPTIONAL  = encouraged but not enforced
 * REQUIRED  = must be set up before login completes
 */
export enum TwoFactorScope {
    DISABLED = 'DISABLED',
    OPTIONAL = 'OPTIONAL',
    REQUIRED = 'REQUIRED',
}

/**
 * SecurityPolicy is a SINGLETON table (always exactly one row, id = 'global').
 * Admins and SuperAdmins configure it via the settings API.
 */
@Table({
    tableName: 'security_policy',
    timestamps: true,
})
export class SecurityPolicy extends Model<SecurityPolicy> {
    /** Fixed primary key so there is always exactly one policy row */
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: 'global',
    })
    id: string;

    // ─── 2FA POLICIES ────────────────────────────────────────────────────────────

    /** 2FA mandate for org members (ADMIN, MODERATOR, CONTENT_ADMIN, SALES, REGIONAL_ADMIN) */
    @Default(TwoFactorScope.DISABLED)
    @Column({ type: DataType.ENUM(...Object.values(TwoFactorScope)) })
    twoFactorPolicyOrgMembers: TwoFactorScope;

    /** 2FA mandate for volunteers (AccountFlags.VOLUNTEER, VOLUNTEER_MANAGER) */
    @Default(TwoFactorScope.DISABLED)
    @Column({ type: DataType.ENUM(...Object.values(TwoFactorScope)) })
    twoFactorPolicyVolunteers: TwoFactorScope;

    // ─── PASSWORD COMPLEXITY POLICY ───────────────────────────────────────────────

    @Default(8)
    @Column(DataType.INTEGER)
    passwordMinLength: number;

    @Default(64)
    @Column(DataType.INTEGER)
    passwordMaxLength: number;

    @Default(false)
    @Column(DataType.BOOLEAN)
    passwordRequireUppercase: boolean;

    @Default(false)
    @Column(DataType.BOOLEAN)
    passwordRequireLowercase: boolean;

    @Default(false)
    @Column(DataType.BOOLEAN)
    passwordRequireNumbers: boolean;

    @Default(false)
    @Column(DataType.BOOLEAN)
    passwordRequireSpecialChars: boolean;

    // ─── PASSWORD ROTATION POLICY ─────────────────────────────────────────────────

    @Default(false)
    @Column(DataType.BOOLEAN)
    passwordRotationEnabled: boolean;

    /** How many days before their password is considered expired */
    @Default(90)
    @Column(DataType.INTEGER)
    passwordRotationDays: number;

    /**
     * How many previous password hashes to store and block reuse of.
     * 0 = no history enforced.
     */
    @Default(5)
    @Column(DataType.INTEGER)
    passwordHistoryCount: number;
}
