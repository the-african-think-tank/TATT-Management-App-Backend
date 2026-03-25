import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostUpvote } from './entities/post-upvote.entity';
import { PostBookmark } from './entities/post-bookmark.entity';
import { PostReport } from './entities/post-report.entity';
import { FeedInsight } from './entities/feed-insight.entity';
import { FeedPrompt } from './entities/feed-prompt.entity';
import { FeedTopic } from './entities/feed-topic.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { FeedAdminController } from './feed-admin.controller';
import { FeedGateway } from './feed.gateway';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Post, PostLike, PostComment, 
            PostUpvote, PostBookmark, PostReport,
            FeedInsight, FeedPrompt, FeedTopic,
            User, Chapter
        ]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
                signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any },
            }),
        }),
        NotificationsModule,
        MailModule,
    ],
    controllers: [FeedController, FeedAdminController],
    providers: [FeedService, FeedGateway],
    exports: [FeedService, FeedGateway],
})
export class FeedModule { }
