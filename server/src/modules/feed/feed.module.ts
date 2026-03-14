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
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { FeedAdminController } from './feed-admin.controller';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Post, PostLike, PostComment, 
            PostUpvote, PostBookmark, PostReport,
            FeedInsight, FeedPrompt,
            User, Chapter
        ]),
    ],
    controllers: [FeedController, FeedAdminController],
    providers: [FeedService],
    exports: [FeedService],
})
export class FeedModule { }
