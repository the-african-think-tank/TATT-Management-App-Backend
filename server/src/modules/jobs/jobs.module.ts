import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobListing } from './entities/job-listing.entity';
import { JobApplication } from './entities/job-application.entity';
import { SavedJob } from './entities/saved-job.entity';
import { JobAlert } from './entities/job-alert.entity';
import { User } from '../iam/entities/user.entity';
import { JobsController, AdminJobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        SequelizeModule.forFeature([JobListing, JobApplication, SavedJob, JobAlert, User]),
        NotificationsModule,
    ],
    controllers: [JobsController, AdminJobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule {}
