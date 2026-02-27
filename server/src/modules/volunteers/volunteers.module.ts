import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';
import { VolunteerGuard } from '../../common/guards/volunteer.guard';
import { VolunteerRole } from './entities/volunteer-role.entity';
import { VolunteerApplication } from './entities/volunteer-application.entity';
import { VolunteerActivity } from './entities/volunteer-activity.entity';
import { VolunteerTrainingResource } from './entities/volunteer-training.entity';
import { VolunteerStat } from './entities/volunteer-stat.entity';
import { User } from '../iam/entities/user.entity';
import { Connection } from '../connections/entities/connection.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([
            VolunteerRole,
            VolunteerApplication,
            VolunteerActivity,
            VolunteerTrainingResource,
            VolunteerStat,
            User,
            Connection,
        ]),
    ],
    controllers: [VolunteersController],
    providers: [VolunteersService, VolunteerGuard],
    exports: [VolunteersService],
})
export class VolunteersModule { }
