import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../iam/entities/user.entity';
import { Post } from '../feed/entities/post.entity';
import { Connection } from '../connections/entities/connection.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { MembershipPlan } from '../membership/entities/membership-plan.entity';
import { PostLike } from '../feed/entities/post-like.entity';
import { PostComment } from '../feed/entities/post-comment.entity';
import { ResourceInteraction } from '../resources/entities/resource-interaction.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User, 
      Post, 
      Connection, 
      Chapter, 
      MembershipPlan,
      PostLike,
      PostComment,
      ResourceInteraction
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
