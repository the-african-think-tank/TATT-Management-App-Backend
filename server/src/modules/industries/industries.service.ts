import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommunityIndustry } from './entities/industry.entity';

@Injectable()
export class IndustriesService {
    constructor(
        @InjectModel(CommunityIndustry) private industryRepo: typeof CommunityIndustry,
    ) { }

    async findAll() {
        return this.industryRepo.findAll({ order: [['name', 'ASC']] });
    }

    async create(name: string) {
        return this.industryRepo.create({ name });
    }

    async update(id: string, name: string) {
        const industry = await this.industryRepo.findByPk(id);
        if (!industry) throw new NotFoundException('Industry not found');
        industry.name = name;
        await industry.save();
        return industry;
    }

    async delete(id: string) {
        const industry = await this.industryRepo.findByPk(id);
        if (!industry) throw new NotFoundException('Industry not found');
        await industry.destroy();
        return { success: true };
    }
}
