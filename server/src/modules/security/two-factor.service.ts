import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from '../iam/entities/user.entity';
import { EmailOtp } from '../security/entities/email-otp.entity';
import { MailService } from '../../common/mail/mail.service';

/** Max OTP verification attempts before the OTP is invalidated */
const MAX_OTP_ATTEMPTS = 5;
/** Email OTP lifetime: 10 minutes */
const OTP_TTL_MINUTES = 10;
/** TOTP drift tolerance: allow ±1 30-second window for clock skew */
const TOTP_WINDOW = 1;
/** Partial auth JWT lifetime — only long enough to complete 2FA step */
const PARTIAL_TOKEN_TTL = '10m';
/**
 * A "partial auth" JWT is issued after a successful password check when the user
 * still needs to complete 2FA. It carries a special scope so the normal
 * JwtAuthGuard cannot be tricked into accepting it for protected endpoints.
 */
const PARTIAL_AUTH_SCOPE = 'two_factor_pending';

@Injectable()
export class TwoFactorService {
    private readonly logger = new Logger(TwoFactorService.name);

    constructor(
        @InjectModel(User) private userRepo: typeof User,
        @InjectModel(EmailOtp) private otpRepo: typeof EmailOtp,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    // ════════════════════════════════════════════════════════════════════════════
    //  PARTIAL AUTH TOKEN (issued between password-check and OTP-check)
    // ════════════════════════════════════════════════════════════════════════════

    issuePartialToken(userId: string, method: 'EMAIL' | 'TOTP'): string {
        return this.jwtService.sign(
            { sub: userId, scope: PARTIAL_AUTH_SCOPE, method },
            { expiresIn: PARTIAL_TOKEN_TTL },
        );
    }

    async validatePartialToken(token: string): Promise<{ userId: string; method: 'EMAIL' | 'TOTP' }> {
        let payload: any;
        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Partial auth token is invalid or has expired.');
        }
        if (payload.scope !== PARTIAL_AUTH_SCOPE) {
            throw new ForbiddenException('Token scope is not valid for 2FA verification.');
        }
        return { userId: payload.sub, method: payload.method };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  TOTP (Authenticator App) — Setup & Verification
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Step 1 of TOTP setup: generate a new secret, store it temporarily as
     * pendingTotpSecret, and return the otpauth URL + a base64 QR code PNG.
     * The secret is NOT yet active — the user must confirm with their first code.
     */
    async initiateTotpSetup(userId: string): Promise<{ otpauthUrl: string; qrCode: string; manualKey: string }> {
        const user = await this.userRepo.findByPk(userId);
        if (!user) throw new UnauthorizedException('User not found.');

        const secretObj = speakeasy.generateSecret({
            length: 20,
            name: `TATT Platform (${user.email})`,
            issuer: 'TATT Platform',
        });

        const otpauthUrl = secretObj.otpauth_url;

        // Store temporarily — cleared on confirm or if user abandons setup
        user.pendingTotpSecret = this.encryptSecret(secretObj.base32);
        await user.save();

        const qrCode = await qrcode.toDataURL(otpauthUrl);

        return {
            otpauthUrl,
            qrCode,        // base64 PNG — frontend renders this as <img src="..." />
            manualKey: secretObj.base32,  // For users who cannot scan QR
        };
    }

    /**
     * Step 2 of TOTP setup: user provides the first 6-digit code from their app.
     * On success: pendingTotpSecret → twoFactorSecret, 2FA enabled, method = TOTP.
     */
    async confirmTotpSetup(userId: string, otp: string): Promise<void> {
        const user = await this.userRepo.findByPk(userId);
        if (!user?.pendingTotpSecret) {
            throw new BadRequestException('No pending TOTP setup found. Please restart the setup process.');
        }

        const secret = this.decryptSecret(user.pendingTotpSecret);
        const isValid = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: otp,
            window: TOTP_WINDOW,
        });

        if (!isValid) {
            throw new UnauthorizedException('Invalid OTP. Please check your authenticator app and try again.');
        }

        user.twoFactorSecret = user.pendingTotpSecret; // already encrypted
        user.pendingTotpSecret = null;
        user.isTwoFactorEnabled = true;
        user.twoFactorMethod = 'TOTP';
        await user.save();
    }

    /**
     * Verify a TOTP OTP during the login flow (after partial token was issued).
     */
    async verifyTotpOtp(userId: string, otp: string): Promise<User> {
        const user = await this.userRepo.findByPk(userId);
        if (!user?.twoFactorSecret || user.twoFactorMethod !== 'TOTP') {
            throw new BadRequestException('TOTP is not configured for this account.');
        }

        const secret = this.decryptSecret(user.twoFactorSecret);
        const isValid = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: otp,
            window: TOTP_WINDOW,
        });

        if (!isValid) {
            throw new UnauthorizedException('Invalid authenticator code. Please try again.');
        }

        return user;
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  EMAIL OTP — Issue & Verify
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Generates a new 6-digit OTP, hashes it, stores it, and sends it by email.
     * Any previously existing OTP for this user is invalidated first.
     */
    async sendEmailOtp(userId: string, ip: string | null): Promise<void> {
        const user = await this.userRepo.findByPk(userId, {
            attributes: ['id', 'email', 'firstName'],
        });
        if (!user) throw new UnauthorizedException('User not found.');

        // Invalidate old OTPs for this user (single active OTP at a time)
        await this.otpRepo.destroy({ where: { userId } });

        const otpRaw = crypto.randomInt(100000, 999999).toString(); // 6-digit, crypto-safe
        const otpHash = await bcrypt.hash(otpRaw, 10);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);

        await this.otpRepo.create({ userId, otpHash, expiresAt, issuedToIp: ip });

        await this.mailService.sendTwoFactorOtp(user.email, user.firstName, otpRaw);
        this.logger.log(`Email OTP dispatched to ${user.email}`);
    }

    /**
     * Enables Email 2FA for a user (called from the profile/settings flow).
     * Sends a confirmation OTP — user must call confirmEmailTwoFactorSetup to complete setup.
     */
    async initiateEmailTwoFactorSetup(userId: string, ip: string | null): Promise<void> {
        await this.sendEmailOtp(userId, ip);
    }

    /**
     * Confirms Email 2FA setup after the user verifies the first OTP sent.
     */
    async confirmEmailTwoFactorSetup(userId: string, otp: string, ip: string | null): Promise<void> {
        await this.verifyEmailOtpInternal(userId, otp, ip);

        const user = await this.userRepo.findByPk(userId);
        user.isTwoFactorEnabled = true;
        user.twoFactorMethod = 'EMAIL';
        await user.save();
    }

    /**
     * Verify an Email OTP during the login flow.
     */
    async verifyEmailOtp(userId: string, otp: string, ip: string | null): Promise<User> {
        await this.verifyEmailOtpInternal(userId, otp, ip);
        return this.userRepo.findByPk(userId);
    }

    private async verifyEmailOtpInternal(userId: string, otp: string, ip: string | null): Promise<void> {
        const record = await this.otpRepo.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        if (!record) {
            throw new UnauthorizedException('No active OTP found. Please request a new code.');
        }

        if (record.expiresAt < new Date()) {
            await record.destroy();
            throw new UnauthorizedException('OTP has expired. Please request a new code.');
        }

        if (record.failedAttempts >= MAX_OTP_ATTEMPTS) {
            await record.destroy();
            throw new ForbiddenException(
                'Too many failed attempts. This OTP has been invalidated — please request a new one.',
            );
        }

        const isValid = await bcrypt.compare(otp, record.otpHash);

        if (!isValid) {
            record.failedAttempts += 1;
            await record.save();

            const remaining = MAX_OTP_ATTEMPTS - record.failedAttempts;
            throw new UnauthorizedException(
                `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
            );
        }

        // Log IP mismatch as a warning (non-blocking — could be mobile network change)
        if (ip && record.issuedToIp && record.issuedToIp !== ip) {
            this.logger.warn(
                `OTP verified from different IP: issued=${record.issuedToIp}, verified=${ip} [userId=${userId}]`,
            );
        }

        // Consume the OTP — single-use
        await record.destroy();
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  DISABLE 2FA
    // ════════════════════════════════════════════════════════════════════════════

    async disableTwoFactor(userId: string): Promise<void> {
        const user = await this.userRepo.findByPk(userId);
        if (!user) throw new UnauthorizedException('User not found.');

        user.isTwoFactorEnabled = false;
        user.twoFactorMethod = null;
        user.twoFactorSecret = null;
        user.pendingTotpSecret = null;
        await user.save();

        // Invalidate any pending OTPs
        await this.otpRepo.destroy({ where: { userId } });
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  SECRET ENCRYPTION (AES-256-GCM at rest)
    //
    //  The TOTP secret is encrypted before being stored in the DB so that a
    //  database breach cannot replay TOTP codes. The key is derived from
    //  APP_SECRET using SHA-256.
    // ════════════════════════════════════════════════════════════════════════════

    private getEncryptionKey(): Buffer {
        const secret = process.env.APP_SECRET || 'change_me_in_production_min32chars!!';
        return crypto.createHash('sha256').update(secret).digest();
    }

    private encryptSecret(plaintext: string): string {
        const key = this.getEncryptionKey();
        const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // Format: iv(hex):authTag(hex):ciphertext(hex)
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    private decryptSecret(ciphertext: string): string {
        const key = this.getEncryptionKey();
        const [ivHex, tagHex, encHex] = ciphertext.split(':');

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(tagHex, 'hex');
        const encrypted = Buffer.from(encHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    }
}
