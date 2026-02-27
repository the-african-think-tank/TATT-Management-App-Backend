import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventChapter } from './entities/event-chapter.entity';
import { EventGuest } from './entities/event-guest.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Event,
            EventChapter,
            EventGuest,
            EventRegistration,
            User,
            Chapter,
        ]),
        MailModule,
    ],
    controllers: [EventsController],
    providers: [EventsService],
})
export class EventsModule { }
