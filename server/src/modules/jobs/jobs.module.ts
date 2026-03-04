import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobListing } from './entities/job-listing.entity';
import { JobApplication } from './entities/job-application.entity';
import { SavedJob } from './entities/saved-job.entity';
import { User } from '../iam/entities/user.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
    imports: [
        SequelizeModule.forFeature([JobListing, JobApplication, SavedJob, User]),
    ],
    controllers: [JobsController],
    providers: [JobsService],
})
export class JobsModule {}
