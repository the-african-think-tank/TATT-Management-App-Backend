import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BusinessPartner } from './entities/business-partner.entity';
import { BusinessDirectoryService } from './business-directory.service';
import { BusinessDirectoryController } from './business-directory.controller';
import { MailModule } from '../../common/mail/mail.module';
import { IamModule } from '../iam/iam.module';
import { Chapter } from '../chapters/entities/chapter.entity';
import { Partnership } from '../partnerships/entities/partnership.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([BusinessPartner, Chapter, Partnership]),
        MailModule,
        IamModule,
    ],
    controllers: [BusinessDirectoryController],
    providers: [BusinessDirectoryService],
    exports: [BusinessDirectoryService],
})
export class BusinessDirectoryModule { }
