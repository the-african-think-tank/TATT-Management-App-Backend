import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../iam/entities/user.entity';
import { Post } from '../feed/entities/post.entity';
import { PostReport } from '../feed/entities/post-report.entity';
import { VolunteerApplication } from '../volunteers/entities/volunteer-application.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([
            User,
            Post,
            PostReport,
            VolunteerApplication
        ])
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
