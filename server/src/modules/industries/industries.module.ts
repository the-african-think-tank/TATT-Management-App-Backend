import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommunityIndustry } from './entities/industry.entity';
import { IndustriesService } from './industries.service';
import { IndustriesController } from './industries.controller';

@Module({
    imports: [SequelizeModule.forFeature([CommunityIndustry])],
    providers: [IndustriesService],
    controllers: [IndustriesController],
    exports: [IndustriesService], // Export if needed for User profile association
})
export class IndustriesModule { }
