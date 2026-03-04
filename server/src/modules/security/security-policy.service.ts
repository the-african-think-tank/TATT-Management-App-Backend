import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { SecurityPolicy } from './entities/security-policy.entity';
import { PasswordHistory } from './entities/password-history.entity';
import { User } from '../iam/entities/user.entity';
import { AccountFlags, SystemRole } from '../iam/enums/roles.enum';
import {
    UpdateTwoFactorPolicyDto,
    UpdatePasswordPolicyDto,
    UpdatePasswordRotationDto,
} from './dto/security-policy.dto';
import { MailService } from '../../common/mail/mail.service';

/** Org-level system roles governed by the org 2FA policy */
const ORG_ROLES: SystemRole[] = [
    SystemRole.ADMIN,
    SystemRole.REGIONAL_ADMIN,
    SystemRole.MODERATOR,
    SystemRole.CONTENT_ADMIN,
    SystemRole.SALES,
];

@Injectable()
export class SecurityPolicyService implements OnModuleInit {
    private readonly logger = new Logger(SecurityPolicyService.name);

    constructor(
        @InjectModel(SecurityPolicy) private policyRepo: typeof SecurityPolicy,
        @InjectModel(PasswordHistory) private historyRepo: typeof PasswordHistory,
        @InjectModel(User) private userRepo: typeof User,
        private mailService: MailService,
    ) { }

    // ─── Bootstrap: ensure singleton row exists ───────────────────────────────
    async onModuleInit() {
        // Wait briefly for Sequelize synchronization to finish if DB_SYNC is true
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const [policy, created] = await this.policyRepo.findOrCreate({
                where: { id: 'global' },
                defaults: { id: 'global' } as any,
            });
            if (created) {
                this.logger.log('Global security policy row created with defaults.');
            }
        } catch (err: any) {
            this.logger.error('Failed to initialize global security policy. Retrying in 3s...', err.message);
            // One-time retry after a longer wait
            setTimeout(async () => {
                try {
                    const [policy, created] = await this.policyRepo.findOrCreate({
                        where: { id: 'global' },
                        defaults: { id: 'global' } as any,
                    });
                    if (created) {
                        this.logger.log('Global security policy row created on retry.');
                    }
                } catch (retryErr: any) {
                    this.logger.error('Permanent failure initializing global security policy:', retryErr.message);
                }
            }, 3000);
        }
    }

    // ─── GET CURRENT POLICY ──────────────────────────────────────────────────
    async getPolicy(): Promise<SecurityPolicy> {
        return this.policyRepo.findByPk('global');
    }

    // ─── UPDATE 2FA POLICY ──────────────────────────────────────────────────
    async updateTwoFactorPolicy(dto: UpdateTwoFactorPolicyDto): Promise<SecurityPolicy> {
        const policy = await this.getPolicy();
        if (dto.twoFactorPolicyOrgMembers !== undefined) {
            policy.twoFactorPolicyOrgMembers = dto.twoFactorPolicyOrgMembers;
        }
        if (dto.twoFactorPolicyVolunteers !== undefined) {
            policy.twoFactorPolicyVolunteers = dto.twoFactorPolicyVolunteers;
        }
        return policy.save();
    }

    // ─── UPDATE PASSWORD COMPLEXITY POLICY ─────────────────────────────────
    async updatePasswordPolicy(dto: UpdatePasswordPolicyDto): Promise<SecurityPolicy> {
        const policy = await this.getPolicy();
        Object.assign(policy, dto);
        return policy.save();
    }

    // ─── UPDATE PASSWORD ROTATION POLICY ────────────────────────────────────
    async updatePasswordRotationPolicy(dto: UpdatePasswordRotationDto): Promise<SecurityPolicy> {
        const policy = await this.getPolicy();
        Object.assign(policy, dto);
        return policy.save();
    }

    // ─── PASSWORD VALIDATOR (used by AuthService on every password change) ──
    async validatePasswordStrength(password: string, policy?: SecurityPolicy): Promise<void> {
        const p = policy || await this.getPolicy();

        if (password.length < p.passwordMinLength) {
            throw new Error(`Password must be at least ${p.passwordMinLength} characters.`);
        }
        if (password.length > p.passwordMaxLength) {
            throw new Error(`Password must not exceed ${p.passwordMaxLength} characters.`);
        }
        if (p.passwordRequireUppercase && !/[A-Z]/.test(password)) {
            throw new Error('Password must contain at least one uppercase letter.');
        }
        if (p.passwordRequireLowercase && !/[a-z]/.test(password)) {
            throw new Error('Password must contain at least one lowercase letter.');
        }
        if (p.passwordRequireNumbers && !/[0-9]/.test(password)) {
            throw new Error('Password must contain at least one number.');
        }
        if (p.passwordRequireSpecialChars && !/[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]/.test(password)) {
            throw new Error('Password must contain at least one special character.');
        }
    }

    // ─── PASSWORD HISTORY CHECK ──────────────────────────────────────────────
    async checkPasswordHistory(userId: string, newPassword: string, policy?: SecurityPolicy): Promise<void> {
        const p = policy || await this.getPolicy();
        if (!p.passwordRotationEnabled || p.passwordHistoryCount === 0) return;

        const { default: bcrypt } = await import('bcryptjs');

        const history = await this.historyRepo.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: p.passwordHistoryCount,
        });

        for (const entry of history) {
            if (await bcrypt.compare(newPassword, entry.passwordHash)) {
                throw new Error(
                    `You cannot reuse any of your last ${p.passwordHistoryCount} passwords.`,
                );
            }
        }
    }

    /**
     * Called by AuthService after every successful password set/reset.
     * Stores the old hash in history and trims records beyond the limit.
     */
    async recordPasswordChange(userId: string, newPasswordHash: string, policy?: SecurityPolicy): Promise<void> {
        const p = policy || await this.getPolicy();

        await this.historyRepo.create({ userId, passwordHash: newPasswordHash });

        // Trim history beyond limit to keep the table lean
        if (p.passwordHistoryCount > 0) {
            const records = await this.historyRepo.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
            });
            const toDelete = records.slice(p.passwordHistoryCount);
            for (const old of toDelete) {
                await old.destroy();
            }
        }
    }

    // ─── 2FA POLICY CHECKER (used by AuthService during login) ──────────────

    /**
     * Returns whether 2FA is REQUIRED for this user based on their role/flags and the current policy.
     */
    async isTwoFactorRequired(user: User): Promise<boolean> {
        const policy = await this.getPolicy();

        const isOrgMember = ORG_ROLES.includes(user.systemRole);
        const isVolunteer =
            user.flags?.includes(AccountFlags.VOLUNTEER) ||
            user.flags?.includes(AccountFlags.VOLUNTEER_MANAGER);

        if (isOrgMember && policy.twoFactorPolicyOrgMembers === 'REQUIRED') return true;
        if (isVolunteer && policy.twoFactorPolicyVolunteers === 'REQUIRED') return true;

        return false;
    }

    // ─── PASSWORD ROTATION EXPIRY NOTIFICATIONS ──────────────────────────────

    /**
     * Should be called by a scheduled job (cron) daily.
     * Notifies org members whose passwords are expiring in 30d, 14d, 7d.
     */
    async sendPasswordExpiryNotifications(): Promise<void> {
        const policy = await this.getPolicy();
        if (!policy.passwordRotationEnabled) return;

        const now = new Date();

        // Users whose password was last changed (using passwordChangedAt)
        // We check org-targeted users only (community members self-manage)
        const candidates = await this.userRepo.findAll({
            where: {
                systemRole: { [Op.in]: ORG_ROLES },
                passwordChangedAt: { [Op.not]: null },
            },
            attributes: ['id', 'firstName', 'email', 'passwordChangedAt', 'passwordExpiryNotifiedAt'],
        });

        const thresholds: Array<{ days: number; label: string; key: string }> = [
            { days: 30, label: '30 days', key: '30d' },
            { days: 14, label: '2 weeks', key: '14d' },
            { days: 7, label: '1 week', key: '7d' },
        ];

        for (const user of candidates) {
            const expiresAt = new Date(user.passwordChangedAt);
            expiresAt.setDate(expiresAt.getDate() + policy.passwordRotationDays);

            const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            for (const threshold of thresholds) {
                if (
                    daysUntilExpiry <= threshold.days &&
                    daysUntilExpiry > 0 &&
                    user.passwordExpiryNotifiedAt !== threshold.key
                ) {
                    try {
                        await this.mailService.sendPasswordExpiryWarning(
                            user.email,
                            user.firstName,
                            expiresAt,
                            threshold.label,
                        );
                        user.passwordExpiryNotifiedAt = threshold.key;
                        await user.save();
                        this.logger.log(`Password expiry warning (${threshold.label}) sent to ${user.email}`);
                    } catch (err: any) {
                        this.logger.error(`Failed to send expiry warning to ${user.email}`, err.message);
                    }
                    break; // Only send the most relevant threshold per cycle
                }
            }

            // Reset notification tracker once password expires (so next cycle restarts)
            if (daysUntilExpiry <= 0 && user.passwordExpiryNotifiedAt) {
                user.passwordExpiryNotifiedAt = null;
                await user.save();
            }
        }
    }
}
