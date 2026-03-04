import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { User } from '../iam/entities/user.entity';
import { MailModule } from '../../common/mail/mail.module';

@Global()
@Module({
    imports: [
        SequelizeModule.forFeature([Notification, User]),
        MailModule,
    ],
    providers: [NotificationsService],
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule { }
