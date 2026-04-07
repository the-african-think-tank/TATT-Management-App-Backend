import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SystemSettingsService } from '../../modules/system-settings/system-settings.service';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly frontendUrl: string;

    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
        private systemSettingsService: SystemSettingsService,
    ) {
        this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    }

    /**
     * Helper to wrap mailerService.sendMail with dynamic transport settings from DB
     */
    private async sendTransactionalMail(options: any) {
        const host = await this.systemSettingsService.getRawValue('MAIL_HOST');
        const port = parseInt(await this.systemSettingsService.getRawValue('MAIL_PORT') || '587', 10);
        const user = await this.systemSettingsService.getRawValue('MAIL_USER');
        const pass = await this.systemSettingsService.getRawValue('MAIL_PASS');
        const fromSetting = await this.systemSettingsService.getRawValue('MAIL_FROM') || 'no-reply@tatt.org';

        this.logger.debug(`SMTP Dispatch Config: host=${host}, port=${port}, user=${user}, from=${fromSetting}`);

        const dynamicTransport = {
            host: host || 'localhost',
            port,
            secure: port === 465, // Use SSL/TLS for 465
            requireTLS: port === 587, // Force STARTTLS for 587
            auth: { user, pass },
            tls: {
                // Do not fail on invalid certs (common issue with some mail servers)
                rejectUnauthorized: false,
                minVersion: 'TLSv1.2',
            },
        };

        return this.mailerService.sendMail({
            ...options,
            transport: dynamicTransport,
            from: options.from || fromSetting,
            envelope: {
                from: user, // Mail from authenticated user
                to: Array.isArray(options.to) ? options.to : [options.to],
            },
        });
    }

    async sendAdminInvite(email: string, firstName: string, token: string) {
        const inviteLink = `${this.frontendUrl}/auth/complete-registration?token=${token}`;

        try {
            await this.sendTransactionalMail({
                to: email,
                subject: 'Welcome to The African Think Tank',
                // For a robust system, we would inject Handlebars compiled templates,
                // but setting html directly here works for raw SMTP configurations.
                html: `
                    <h2>Hello ${firstName},</h2>
                    <p>You have been invited to join the management portal for The African Think Tank.</p>
                    <p>Please click the link below to set your password and activate your account:</p>
                    <p><a href="${inviteLink}" style="padding: 10px 20px; background-color: #0044cc; color: #fff; text-decoration: none; border-radius: 5px;">Activate Account</a></p>
                    <br/>
                    <p>If you did not expect this invitation, please ignore this email.</p>
                `,
            });
            this.logger.log(`Admin Invite email dispatched successfully to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send invite email to ${email}`, error.stack);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendPasswordReset(email: string, token: string) {
        const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;

        try {
            await this.sendTransactionalMail({
                to: email,
                subject: 'TATT Password Reset Request',
                html: `
                    <h2>Password Reset</h2>
                    <p>We received a request to reset your password for your TATT account.</p>
                    <p>Click the link below to set a new password. This link expires in 1 Hour.</p>
                    <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #cc0000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                    <br/>
                    <p>If you did not request this, you can safely ignore this email.</p>
                `,
            });
            this.logger.log(`Password reset email dispatched successfully to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send reset email to ${email}`, error.stack);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendSubscriptionDowngradeNotice(email: string, firstName: string, reason: string) {
        try {
            await this.sendTransactionalMail({
                to: email,
                subject: 'Your TATT Membership Has Been Updated',
                html: `
                    <h2>Hi ${firstName},</h2>
                    <p>We regret to inform you that your TATT membership has been downgraded to the <strong>Free tier</strong>.</p>
                    <p><strong>Reason:</strong> ${reason === 'past_due' ? 'Payment past due' : 'Subscription canceled or unpaid'}</p>
                    <p>You can re-subscribe at any time from your member dashboard to restore access to premium content and features.</p>
                    <br/>
                    <p>Thank you for being part of the TATT community.</p>
                `,
            });
            this.logger.log(`Downgrade notice sent to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send downgrade notice to ${email}`, error.stack);
        }
    }

    async sendRenewalReminder(email: string, firstName: string, expiresAt: Date) {
        const expiryStr = expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const renewLink = `${this.frontendUrl}/member/subscription`;

        try {
            await this.sendTransactionalMail({
                to: email,
                subject: 'Your TATT Membership is Expiring Soon',
                html: `
                    <h2>Hi ${firstName},</h2>
                    <p>Your TATT membership is set to expire on <strong>${expiryStr}</strong>.</p>
                    <p>Since you don't have auto-pay enabled, please renew your subscription manually to avoid losing access to member benefits.</p>
                    <p><a href="${renewLink}" style="padding: 10px 20px; background-color: #0044cc; color: #fff; text-decoration: none; border-radius: 5px;">Renew Now</a></p>
                    <br/>
                    <p>Thank you for being a valued member of the TATT community.</p>
                `,
            });
            this.logger.log(`Renewal reminder sent to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send renewal reminder to ${email}`, error.stack);
        }
    }

    async sendConnectionRequest(
        recipientEmail: string,
        recipientFirstName: string,
        senderFullName: string,
        message: string,
    ) {
        const profileLink = `${this.frontendUrl}/member/network/requests`;

        try {
            await this.sendTransactionalMail({
                to: recipientEmail,
                subject: `${senderFullName} wants to connect with you on TATT`,
                html: `
                    <h2>Hi ${recipientFirstName},</h2>
                    <p><strong>${senderFullName}</strong> has sent you a connection request on The African Think Tank platform.</p>
                    <blockquote style="border-left: 4px solid #0044cc; padding-left: 16px; color: #555; margin: 16px 0;">
                        &ldquo;${message}&rdquo;
                    </blockquote>
                    <p>Review their profile and decide whether you'd like to connect:</p>
                    <p>
                        <a href="${profileLink}" style="padding: 10px 20px; background-color: #0044cc; color: #fff; text-decoration: none; border-radius: 5px;">
                            View Connection Request
                        </a>
                    </p>
                    <br/>
                    <p>If you do not wish to connect, you can simply decline the request from your dashboard.</p>
                    <p>Thank you for being a valued member of the TATT community.</p>
                `,
            });
            this.logger.log(`Connection request email sent to ${recipientEmail} from ${senderFullName}`);
        } catch (error: any) {
            this.logger.error(`Failed to send connection request email to ${recipientEmail}`, error.stack);
            // Re-throw so the service can swallow it non-blockingly
            throw error;
        }
    }

    async sendTwoFactorOtp(email: string, firstName: string, otp: string) {
        try {
            await this.sendTransactionalMail({
                to: email,
                subject: 'Your TATT Sign-In Verification Code',
                html: `
                    <h2>Hi ${firstName},</h2>
                    <p>Your verification code for The African Think Tank platform is:</p>
                    <div style="text-align:center; margin: 24px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0044cc; font-family: monospace;">
                            ${otp}
                        </span>
                    </div>
                    <p>This code expires in <strong>10 minutes</strong> and can only be used once.</p>
                    <p style="color: #cc0000;"><strong>Do not share this code with anyone.</strong> TATT staff will never ask for your code.</p>
                    <br/>
                    <p>If you did not attempt to sign in, please secure your account immediately by resetting your password.</p>
                `,
            });
            this.logger.log(`2FA OTP email sent to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send 2FA OTP to ${email}`, error.stack);
            throw error;
        }
    }

    async sendPasswordExpiryWarning(email: string, firstName: string, expiresAt: Date, timeframe: string) {
        const expiryStr = expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const changeLink = `${this.frontendUrl}/auth/password/change`;

        try {
            await this.sendTransactionalMail({
                to: email,
                subject: `Action Required: Your TATT password expires in ${timeframe}`,
                html: `
                    <h2>Hi ${firstName},</h2>
                    <p>Your TATT account password is set to expire on <strong>${expiryStr}</strong> — that's in <strong>${timeframe}</strong>.</p>
                    <p>To avoid being locked out, please update your password before it expires:</p>
                    <p>
                        <a href="${changeLink}" style="padding: 10px 20px; background-color: #cc6600; color: #fff; text-decoration: none; border-radius: 5px;">
                            Change My Password
                        </a>
                    </p>
                    <br/>
                    <p style="color: #555; font-size: 14px;">
                        This is a security policy reminder. If you have already changed your password recently,
                        you can disregard this notice.
                    </p>
                    <p>Thank you for keeping your account secure.</p>
                `,
            });
            this.logger.log(`Password expiry warning (${timeframe}) sent to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send password expiry warning to ${email}`, error.stack);
        }
    }

    async sendEventNotification(email: string, firstName: string, eventTitle: string, eventDate: string, eventType: string, eventId: string) {
        const eventLink = `${this.frontendUrl}/events/${eventId}`;

        try {
            await this.sendTransactionalMail({
                to: email,
                subject: `New ${eventType} Announced: ${eventTitle}`,
                html: `
                    <h2>Hi ${firstName},</h2>
                    <p>A new <strong>${eventType}</strong> has been scheduled for the TATT community!</p>
                    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0044cc;">${eventTitle}</h3>
                        <p><strong>Date:</strong> ${eventDate}</p>
                        <p>Join us for this special gathering! Click the button below to view details and register:</p>
                        <p>
                            <a href="${eventLink}" style="padding: 10px 20px; background-color: #0044cc; color: #fff; text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Event Details
                            </a>
                        </p>
                    </div>
                    <p>We look forward to seeing you there!</p>
                    <p>Thank you,<br/>The TATT Team</p>
                `,
            });
            this.logger.log(`Event notification email sent to ${email} for event: ${eventTitle}`);
        } catch (error: any) {
            this.logger.error(`Failed to send event notification email to ${email}`, error.stack);
        }
    }

    async sendNotificationEmail(email: string, firstName: string, title: string, message: string, actionLink?: string, actionLabel?: string) {
        try {
            await this.sendTransactionalMail({
                to: email,
                subject: `TATT: ${title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #0044cc;">Hello ${firstName},</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
                        ${actionLink ? `
                            <div style="margin: 30px 0; text-align: center;">
                                <a href="${actionLink}" style="padding: 12px 24px; background-color: #0044cc; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                    ${actionLabel || 'View Details'}
                                </a>
                            </div>
                        ` : ''}
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #888;">You received this email because of your TATT account notification settings. Log in to your dashboard to manage your notifications.</p>
                        <p style="font-size: 12px; color: #888; margin-top: 10px;">&copy; ${new Date().getFullYear()} The African Think Tank. All rights reserved.</p>
                    </div>
                `,
            });
            this.logger.log(`Notification email sent to ${email}: ${title}`);
        } catch (error: any) {
            this.logger.error(`Failed to send notification email to ${email}`, error.stack);
        }
    }

    async sendDailyDigest(email: string, firstName: string, platformPosts: number, chapterPosts: number, chapterName?: string) {
        try {
            await this.sendTransactionalMail({
                to: email,
                subject: `Daily Community Update — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #ffffff; border: 1px solid #e1e1e1; border-radius: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #000; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0;">TATT Community</h1>
                            <p style="color: #666; font-size: 14px; margin-top: 5px;">Daily Digest • ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <h2 style="color: #000; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Hi ${firstName},</h2>
                        <p style="color: #444; font-size: 16px; line-height: 1.6;">The TATT ecosystem has been active today! Here's a snapshot of what's new in your professional network:</p>
                        
                        <div style="background-color: #f7f9fc; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #edf1f7;">
                            <div style="display: flex; justify-content: space-around; text-align: center;">
                                <div style="flex: 1;">
                                    <div style="font-size: 32px; font-weight: 900; color: #ADFF2F; text-shadow: 1px 1px 0px rgba(0,0,0,0.1);">${platformPosts}</div>
                                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #888; letter-spacing: 1px; margin-top: 5px;">New Posts Today</div>
                                </div>
                                ${chapterName ? `
                                <div style="flex: 1; border-left: 1px solid #e1e1e1;">
                                    <div style="font-size: 32px; font-weight: 900; color: #000;">${chapterPosts}</div>
                                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #888; letter-spacing: 1px; margin-top: 5px;">In ${chapterName}</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <p style="text-align: center; margin-top: 40px;">
                            <a href="${this.frontendUrl}/dashboard/feed" style="background-color: #ADFF2F; color: #000; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; box-shadow: 0 4px 14px rgba(173, 255, 47, 0.3);">
                                Check out the Feed
                            </a>
                        </p>
                        
                        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
                            <p style="font-size: 10px; color: #aaa; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;">The African Think Tank</p>
                            <p style="font-size: 11px; color: #aaa; line-height: 1.5; margin-top: 10px;">
                                You're receiving this because you're a member of the TATT professional ecosystem.<br/>
                                <a href="${this.frontendUrl}/dashboard/settings" style="color: #666; text-decoration: underline;">Unsubscribe</a> or manage preferences.
                            </p>
                        </div>
                    </div>
                `,
            });
            this.logger.log(`Daily digest email sent to ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send daily digest to ${email}`, error.stack);
        }
    }
}

