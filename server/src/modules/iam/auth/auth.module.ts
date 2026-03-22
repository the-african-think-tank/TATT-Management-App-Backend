import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';
import { SecurityModule } from '../../security/security.module';
import { UserSeederService } from './user-seeder.service';

@Module({
    imports: [
        SequelizeModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt', session: false }),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
                signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any },
            }),
        }),
        SecurityModule, // Provides SecurityPolicyService + TwoFactorService
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserSeederService],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }
