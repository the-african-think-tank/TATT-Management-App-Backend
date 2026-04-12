import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PlatformTerms } from './entities/platform-terms.entity';
import { User } from '../iam/entities/user.entity';
import { NotificationsService } from '../notifications/services/notifications.service';
import { BroadcastsService } from '../notifications/services/broadcasts.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { BroadcastAudience } from '../notifications/entities/broadcast.entity';

@Injectable()
export class TermsService {
    private readonly logger = new Logger(TermsService.name);

    constructor(
        @InjectModel(PlatformTerms) private termsRepo: typeof PlatformTerms,
        @InjectModel(User) private userRepo: typeof User,
        @Inject(forwardRef(() => NotificationsService))
        private readonly notificationsService: NotificationsService,
        @Inject(forwardRef(() => BroadcastsService))
        private readonly broadcastsService: BroadcastsService,
    ) {}

    /** Retrieve all versions, newest first */
    async findAll() {
        return this.termsRepo.findAll({
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
            order: [['version', 'DESC']],
        });
    }

    /** Get the currently active (latest) terms — public endpoint */
    async getActive() {
        const terms = await this.termsRepo.findOne({
            where: { isActive: true },
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
            order: [['version', 'DESC']],
        });
        return terms ?? null;
    }

    /** Get a specific version by ID */
    async findById(id: string) {
        const terms = await this.termsRepo.findByPk(id, {
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
        });
        if (!terms) throw new NotFoundException('Terms version not found');
        return terms;
    }

    /**
     * Publish a new version of the Terms of Service.
     * - Archives all previous versions by setting isActive = false.
     * - Creates a new versioned record attributing the change to the admin.
     * - Broadcasts platform-wide notifications via in-app alerts and system broadcast.
     */
    async publish(adminId: string, content: string): Promise<PlatformTerms> {
        const latest = await this.termsRepo.findOne({ order: [['version', 'DESC']] });
        const nextVersion = latest ? latest.version + 1 : 1;

        // Archive previous active version
        await this.termsRepo.update({ isActive: false }, { where: { isActive: true } });

        // Create new version
        const newTerms = await this.termsRepo.create({
            content,
            version: nextVersion,
            updatedById: adminId,
            isActive: true,
        });

        this.logger.log(`Terms of Service v${nextVersion} published by admin ${adminId}`);

        // Fire-and-forget notifications
        this.notifyAllUsers(nextVersion).catch((err) =>
            this.logger.error('Failed to notify users of ToS update', err?.stack),
        );

        return newTerms;
    }

    private async notifyAllUsers(version: number) {
        try {
            // System broadcast to all members (appears in announcements)
            await this.broadcastsService.createSystemBroadcast({
                title: 'Terms of Service Updated',
                message: `Our Terms of Service have been updated to Version ${version}. Please review the latest version to understand your rights and responsibilities on the TATT platform.`,
                audienceType: BroadcastAudience.ALL,
            });

            // Individual in-app notification for each active user
            const users = await this.userRepo.findAll({
                where: { isActive: true },
                attributes: ['id'],
            });

            await Promise.all(
                users.map((u) =>
                    this.notificationsService.create(
                        u.id,
                        NotificationType.SYSTEM_ALERT,
                        'Terms of Service Updated',
                        `Our Terms of Service have been updated to Version ${version}. Please review the latest terms.`,
                    ),
                ),
            );

            this.logger.log(`ToS v${version} notifications dispatched to ${users.length} users`);
        } catch (error) {
            this.logger.error('Failed to broadcast ToS update', error?.stack);
        }
    }
}
