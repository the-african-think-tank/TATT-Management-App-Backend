import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UsersCleanupService } from './users-cleanup.service';
import { UsersController } from './users.controller';
import { AccountController } from './account.controller';
import { Chapter } from '../../chapters/entities/chapter.entity';
import { ProfessionalInterest } from '../../interests/entities/interest.entity';
import { UserInterest } from '../../interests/entities/user-interest.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Chapter, ProfessionalInterest, UserInterest]),
    ],
    controllers: [UsersController, AccountController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
