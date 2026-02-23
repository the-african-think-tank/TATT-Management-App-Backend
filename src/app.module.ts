import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { IamModule } from './modules/iam/iam.module';
import { BillingModule } from './modules/billing/billing.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { InterestsModule } from './modules/interests/interests.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { SecurityModule } from './modules/security/security.module';
import { FeedModule } from './modules/feed/feed.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MailModule } from './common/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            expandVariables: true,
        }),
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
        UploadsModule,      // File/Media Upload handling (images, video, audio, docs)
        MessagesModule,     // Real-time Direct Messaging Domain
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
