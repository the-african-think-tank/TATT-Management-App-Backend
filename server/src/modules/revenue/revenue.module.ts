import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([FinancialTransaction, User, Chapter]),
    ],
    controllers: [RevenueController],
    providers: [RevenueService],
    exports: [RevenueService],
})
export class RevenueModule {}
