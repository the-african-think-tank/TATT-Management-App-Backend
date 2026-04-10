import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../iam/entities/user.entity';
import { Post } from '../feed/entities/post.entity';
import { PostReport } from '../feed/entities/post-report.entity';
import { VolunteerApplication } from '../volunteers/entities/volunteer-application.entity';
import { RevenueModule } from '../revenue/revenue.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            User,
            Post,
            PostReport,
            VolunteerApplication
        ]),
        RevenueModule
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
