import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Broadcast, BroadcastAudience, BroadcastStatus } from '../entities/broadcast.entity';
import { User } from '../../iam/entities/user.entity';
import { Notification, NotificationType } from '../entities/notification.entity';
import { SystemRole, CommunityTier } from '../../iam/enums/roles.enum';
import { MailService } from '../../../common/mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BroadcastsService {
    private readonly logger = new Logger(BroadcastsService.name);

    constructor(
        @InjectModel(Broadcast) private broadcastRepo: typeof Broadcast,
        @InjectModel(User) private userRepo: typeof User,
        @InjectModel(Notification) private notificationRepo: typeof Notification,
        private mailService: MailService,
    ) { }

    async createBroadcast(authorId: string, data: any) {
        const broadcast = await this.broadcastRepo.create({
            ...data,
            authorId,
            status: data.scheduledAt ? BroadcastStatus.SCHEDULED : BroadcastStatus.DRAFT,
        });

        if (!data.scheduledAt && data.status === BroadcastStatus.SENT) {
            await this.sendBroadcast(broadcast.id);
        }

        return broadcast;
    }

    /**
     * Creates and immediately sends a system-triggered broadcast.
     * These appear in the Platform Management communications archive.
     */
    async createSystemBroadcast(data: {
        title: string;
        message: string;
        audienceType: BroadcastAudience;
        targetTier?: string;
        targetChapterId?: string;
        type?: NotificationType;
    }) {
        const systemAuthor = await this.userRepo.findOne({ 
            where: { systemRole: SystemRole.SUPERADMIN } 
        });

        const broadcast = await this.broadcastRepo.create({
            title: data.title,
            message: data.message,
            audienceType: data.audienceType,
            targetTier: data.targetTier,
            targetChapterId: data.targetChapterId,
            type: data.type || NotificationType.SYSTEM_ANNOUNCEMENT,
            status: BroadcastStatus.SENT,
            authorId: systemAuthor?.id || '00000000-0000-0000-0000-000000000000',
            sentAt: new Date(),
        });

        return this.sendBroadcast(broadcast.id);
    }

    async getBroadcasts() {
        return this.broadcastRepo.findAll({
            include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']],
        });
    }

    async sendBroadcast(broadcastId: string) {
        const broadcast = await this.broadcastRepo.findByPk(broadcastId);
        if (!broadcast) throw new NotFoundException('Broadcast not found');

        let userWhere: any = { isActive: true };

        if (broadcast.audienceType === BroadcastAudience.ORG_MEMBERS) {
            userWhere.systemRole = { [Op.ne]: SystemRole.COMMUNITY_MEMBER };
        } else if (broadcast.audienceType === BroadcastAudience.TIER_SPECIFIC) {
            userWhere.communityTier = broadcast.targetTier;
        } else if (broadcast.audienceType === BroadcastAudience.CHAPTER_SPECIFIC) {
            userWhere.chapterId = broadcast.targetChapterId;
        }

        const recipients = await this.userRepo.findAll({ where: userWhere });

        for (const user of recipients) {
            // Create in-app notification
            await this.notificationRepo.create({
                userId: user.id,
                type: broadcast.type || NotificationType.SYSTEM_ANNOUNCEMENT,
                title: broadcast.title,
                message: broadcast.message,
            });

            // Send email
            try {
                await this.mailService.sendNotificationEmail(
                    user.email,
                    user.firstName || 'Member',
                    broadcast.title,
                    broadcast.message,
                    'https://tatt.app/dashboard', // Base URL for dashboard
                    'View Announcement'
                );
            } catch (err) {
                this.logger.error(`Failed to send broadcast email to ${user.email}: ${err.message}`);
            }
        }

        broadcast.status = BroadcastStatus.SENT;
        broadcast.sentAt = new Date();
        broadcast.recipientCount = recipients.length;
        await broadcast.save();

        return { success: true, recipients: recipients.length };
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async processScheduledBroadcasts() {
        const now = new Date();
        const pending = await this.broadcastRepo.findAll({
            where: {
                status: BroadcastStatus.SCHEDULED,
                scheduledAt: { [Op.lte]: now },
            },
        });

        for (const b of pending) {
            this.logger.log(`Processing scheduled broadcast: ${b.title}`);
            await this.sendBroadcast(b.id);
        }
    }

    async deleteBroadcast(id: string) {
        const b = await this.broadcastRepo.findByPk(id);
        if (!b) throw new NotFoundException();
        await b.destroy();
    }
}
