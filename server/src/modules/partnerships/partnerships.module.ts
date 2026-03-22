import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Partnership } from './entities/partnership.entity';
import { PartnershipService } from './partnerships.service';
import { PartnershipController } from './partnerships.controller';
import { IamModule } from '../iam/iam.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Partnership]),
        IamModule, // For authentication/guards
    ],
    controllers: [PartnershipController],
    providers: [PartnershipService],
    exports: [PartnershipService],
})
export class PartnershipsModule { }
