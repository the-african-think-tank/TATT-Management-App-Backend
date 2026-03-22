import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';
import { BroadcastsService } from './services/broadcasts.service';
import { NotificationsController } from './controllers/notifications.controller';
import { BroadcastsController } from './controllers/broadcasts.controller';
import { Broadcast } from './entities/broadcast.entity';
import { User } from '../iam/entities/user.entity';
import { MailModule } from '../../common/mail/mail.module';

@Global()
@Module({
    imports: [
        SequelizeModule.forFeature([Notification, Broadcast, User]),
        MailModule,
    ],
    providers: [NotificationsService, BroadcastsService],
    controllers: [NotificationsController, BroadcastsController],
    exports: [NotificationsService, BroadcastsService],
})
export class NotificationsModule { }
