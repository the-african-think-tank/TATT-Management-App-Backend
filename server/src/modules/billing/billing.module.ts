import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { User } from '../iam/entities/user.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { MembershipPlan } from '../membership/entities/membership-plan.entity';
import { Discount } from '../membership/entities/discount.entity';
import { FinancialTransaction } from '../revenue/entities/financial-transaction.entity';

import { Order } from '../store/entities/order.entity';

@Module({
    imports: [SequelizeModule.forFeature([User, EventRegistration, MembershipPlan, Discount, FinancialTransaction, Order])],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule { }
