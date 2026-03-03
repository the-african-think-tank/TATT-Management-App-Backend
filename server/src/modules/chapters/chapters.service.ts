import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chapter } from './entities/chapter.entity';
import { User } from '../iam/entities/user.entity';
import { CreateChapterDto } from './dto/chapters.dto';

@Injectable()
export class ChaptersService {
    constructor(
        @InjectModel(Chapter) private chapterRepository: typeof Chapter,
        @InjectModel(User) private userRepository: typeof User,
    ) { }

    async createChapter(dto: CreateChapterDto) {
        const existingCode = await this.chapterRepository.findOne({ where: { code: dto.code } });
        if (existingCode) {
            throw new ConflictException(`Chapter with code ${dto.code} already exists.`);
        }

        const chapter = await this.chapterRepository.create({ ...dto });
        return { message: 'Chapter created successfully', data: chapter };
    }

    async getAllChapters() {
        return this.chapterRepository.findAll();
    }

    async getChapterById(id: string) {
        const chapter = await this.chapterRepository.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'regionalManager',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle'],
                },
            ],
        });
        if (!chapter) {
            throw new NotFoundException('Chapter not found');
        }
        return chapter;
    }

    async getChapterMembers(chapterId: string, _viewerId?: string) {
        await this.getChapterById(chapterId); // ensure chapter exists
        const [members, total] = await Promise.all([
            this.userRepository.findAll({
                where: { chapterId },
                attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle'],
                limit: 50,
            }),
            this.userRepository.count({ where: { chapterId } }),
        ]);
        return { members, total };
    }

    async updateChapterManager(id: string, managerId: string) {
        const chapter = await this.getChapterById(id);
        chapter.regionalManagerId = managerId;
        await chapter.save();
        return { message: 'Regional manager updated successfully', data: chapter };
    }
}
