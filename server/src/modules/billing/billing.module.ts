import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { User } from '../iam/entities/user.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { MembershipPlan } from '../membership/entities/membership-plan.entity';

@Module({
    imports: [SequelizeModule.forFeature([User, EventRegistration, MembershipPlan])],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule { }
