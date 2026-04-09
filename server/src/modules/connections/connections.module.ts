import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Connection } from './entities/connection.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { ProfessionalInterest } from '../interests/entities/interest.entity';
import { UserInterest } from '../interests/entities/user-interest.entity';
import { Post } from '../feed/entities/post.entity';
import { CommunityIndustry } from '../industries/entities/industry.entity';
import { ConnectionsController } from './connections.controller';
import { MembersController } from './members.controller';
import { ConnectionsService } from './connections.service';
import { RecommenderService } from './recommender.service';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Connection, 
            User, 
            Chapter, 
            ProfessionalInterest, 
            UserInterest, 
            Post, 
            CommunityIndustry
        ]),
        MailModule,
    ],
    controllers: [ConnectionsController, MembersController],
    providers: [ConnectionsService, RecommenderService],
    exports: [ConnectionsService, RecommenderService],
})
export class ConnectionsModule { }
