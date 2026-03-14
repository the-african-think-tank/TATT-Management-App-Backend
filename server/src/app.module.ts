import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './core/database/database.module';
import { IamModule } from './modules/iam/iam.module';
import { BillingModule } from './modules/billing/billing.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { InterestsModule } from './modules/interests/interests.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { SecurityModule } from './modules/security/security.module';
import { FeedModule } from './modules/feed/feed.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { UploadsModule } from './modules/media-uploads/uploads.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { EventsModule } from './modules/events/events.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MembershipModule } from './modules/membership/membership.module';
import { MailModule } from './common/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { StoreModule } from './modules/store/store.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            expandVariables: true,
        }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100, // Anti-abuse rate limiting per IP
        }]),
        DatabaseModule,
        IamModule,          // Identity and Access Management Domain
        BillingModule,      // Subscriptions & Payments Domain
        ChaptersModule,     // Geolocation and Chapter Management Domain
        InterestsModule,    // Professional Interests and Skills Domain
        ConnectionsModule,  // Member Networking & Connections Domain
        SecurityModule,     // 2FA, Password Policy & Rotation Domain
        FeedModule,         // Community Feed, Posts, Likes & Comments Domain
        ResourcesModule,    // Knowledge & Resource Hub (guides, documents, partnerships)
        UploadsModule,      // File/Media Upload handling (images, video, audio, docs)
        MessagesModule,     // Real-time Direct Messaging Domain
        NotificationsModule, // User In-app & Email Notifications Domain
        VolunteersModule,   // Volunteer Management Domain
        EventsModule,       // Events & Workshops Domain
        JobsModule,         // Job Board & Opportunities Domain
        DashboardModule,    // Admin Dashboards & Stats Domain
        MembershipModule,   // Admin Membership Center & Discounts Domain
        StoreModule,        // TATT Store — Products, Inventory & Orders Domain
        MailModule,         // Transactional Email Domain (Global)
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Top-level middleware bindings (e.g. correlational IDs, logging)
    }
}
