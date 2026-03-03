import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chapter } from './entities/chapter.entity';
import { User } from '../iam/entities/user.entity';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';

@Module({
    imports: [SequelizeModule.forFeature([Chapter, User])],
    controllers: [ChaptersController],
    providers: [ChaptersService],
    exports: [ChaptersService],
})
export class ChaptersModule { }
