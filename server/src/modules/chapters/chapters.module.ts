import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chapter } from './entities/chapter.entity';
import { ChapterActivity } from './entities/chapter-activity.entity';
import { User } from '../iam/entities/user.entity';
import { Post } from '../feed/entities/post.entity';
import { PostLike } from '../feed/entities/post-like.entity';
import { PostComment } from '../feed/entities/post-comment.entity';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { VolunteerApplication } from '../volunteers/entities/volunteer-application.entity';
import { VolunteerRole } from '../volunteers/entities/volunteer-role.entity';

@Module({
    imports: [SequelizeModule.forFeature([Chapter, ChapterActivity, User, Post, PostLike, PostComment, VolunteerApplication, VolunteerRole])],
    controllers: [ChaptersController],
    providers: [ChaptersService],
    exports: [ChaptersService],
})
export class ChaptersModule { }
