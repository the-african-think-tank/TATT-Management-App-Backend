import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { Op } from 'sequelize';
import { MailService } from '../../../common/mail/mail.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

@Injectable()
export class UsersCleanupService {
    private readonly logger = new Logger(UsersCleanupService.name);

    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private mailService: MailService,
        private notificationsService: NotificationsService,
    ) { }

    /** Runs every day at midnight */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleAccountDeletions() {
        this.logger.log('Starting scheduled account deletion cleanup...');

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // 1. Permanently delete accounts scheduled more than 14 days ago
        const usersToDelete = await this.userRepository.findAll({
            where: {
                deletionRequestedAt: {
                    [Op.lte]: twoWeeksAgo,
                },
            },
        });

        for (const user of usersToDelete) {
            this.logger.log(`Permanently deleting account for ${user.email} (Requested: ${user.deletionRequestedAt})`);

            // Send final goodbye email
            try {
                await this.mailService.sendNotificationEmail(
                    user.email,
                    user.firstName,
                    'Account Permanently Deleted',
                    'Your TATT account and all associated data have been permanently removed as requested 14 days ago. We are sorry to see you go.'
                );
            } catch (err) {
                this.logger.error(`Failed to send final deletion email to ${user.email}`);
            }

            await user.destroy();
        }

        // 2. Send reminders to accounts scheduled for deletion
        const pendingDeletions = await this.userRepository.findAll({
            where: {
                deletionRequestedAt: {
                    [Op.not]: null,
                    [Op.gt]: twoWeeksAgo,
                },
            },
        });

        for (const user of pendingDeletions) {
            const deletionDate = new Date(user.deletionRequestedAt);
            deletionDate.setDate(deletionDate.getDate() + 14);

            const daysRemaining = Math.ceil((deletionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            // Send periodic reminders (e.g. at 7 days, 3 days, 1 day remaining)
            if ([7, 3, 1].includes(daysRemaining)) {
                this.logger.log(`Sending deletion reminder to ${user.email} (${daysRemaining} days left)`);

                const message = `Your account is scheduled for permanent deletion in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}. If you wish to keep your account, please log in and cancel the request from your settings.`;

                await this.notificationsService.create(
                    user.id,
                    NotificationType.ACCOUNT,
                    'Account Deletion Reminder',
                    message
                );

                await this.mailService.sendNotificationEmail(
                    user.email,
                    user.firstName,
                    'Account Deletion Reminder',
                    message,
                    `${process.env.FRONTEND_URL}/dashboard/settings`,
                    'Go to Settings'
                );
            }
        }

        this.logger.log('Account deletion cleanup complete.');
    }
}
