import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chapter } from './entities/chapter.entity';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';

@Module({
    imports: [SequelizeModule.forFeature([Chapter])],
    controllers: [ChaptersController],
    providers: [ChaptersService],
    exports: [ChaptersService],
})
export class ChaptersModule { }
