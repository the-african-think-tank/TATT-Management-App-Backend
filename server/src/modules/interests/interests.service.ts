import { Injectable, ConflictException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProfessionalInterest } from './entities/interest.entity';
import { CreateInterestDto } from './dto/interests.dto';

@Injectable()
export class InterestsService implements OnApplicationBootstrap {
    private readonly logger = new Logger(InterestsService.name);

    constructor(
        @InjectModel(ProfessionalInterest) private interestRepository: typeof ProfessionalInterest,
    ) { }

    async onApplicationBootstrap() {
        const count = await this.interestRepository.count();
        if (count === 0) {
            this.logger.log('Seeding initial Professional Interests...');
            const interests = [
                'Entrepreneurship', 'Technology', 'Healthcare', 'Agriculture',
                'Finance', 'Education', 'Social Impact', 'Arts & Culture',
                'Legal', 'Manufacturing', 'Green Energy', 'Public Policy',
                'Real Estate', 'Logistics', 'Marketing', 'Data Science',
                'Software Engineering', 'E-commerce', 'Creative Arts', 'Leadership'
            ];

            for (const name of interests) {
                await this.interestRepository.create({ name });
            }
            this.logger.log(`Successfully seeded ${interests.length} professional interests.`);
        }
    }

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
