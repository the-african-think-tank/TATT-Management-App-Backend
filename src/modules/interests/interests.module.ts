import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfessionalInterest } from './entities/interest.entity';
import { UserInterest } from './entities/user-interest.entity';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

@Module({
    imports: [SequelizeModule.forFeature([ProfessionalInterest, UserInterest])],
    controllers: [InterestsController],
    providers: [InterestsService],
    exports: [InterestsService],
})
export class InterestsModule { }
