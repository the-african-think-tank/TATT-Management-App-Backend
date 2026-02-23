import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProfessionalInterest } from './entities/interest.entity';
import { CreateInterestDto } from './dto/interests.dto';

@Injectable()
export class InterestsService {
    constructor(
        @InjectModel(ProfessionalInterest) private interestRepository: typeof ProfessionalInterest,
    ) { }

    async createInterest(dto: CreateInterestDto) {
        const existingInterest = await this.interestRepository.findOne({ where: { name: dto.name } });
        if (existingInterest) {
            throw new ConflictException(`Professional interest '${dto.name}' already exists.`);
        }

        const interest = await this.interestRepository.create({ ...dto });
        return { message: 'Interest created successfully', data: interest };
    }

    async getAllInterests() {
        return this.interestRepository.findAll({ order: [['name', 'ASC']] });
    }
}
