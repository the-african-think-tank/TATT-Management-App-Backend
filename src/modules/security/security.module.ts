import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { SecurityPolicy } from './entities/security-policy.entity';
import { PasswordHistory } from './entities/password-history.entity';
import { EmailOtp } from './entities/email-otp.entity';
import { User } from '../iam/entities/user.entity';
import { SecurityPolicyService } from './security-policy.service';
import { TwoFactorService } from './two-factor.service';
import { SecurityController } from './security.controller';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [
        SequelizeModule.forFeature([SecurityPolicy, PasswordHistory, EmailOtp, User]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
                signOptions: { expiresIn: '7d' },
            }),
        }),
        MailModule,
    ],
    controllers: [SecurityController],
    providers: [SecurityPolicyService, TwoFactorService],
    exports: [SecurityPolicyService, TwoFactorService],
})
export class SecurityModule { }
