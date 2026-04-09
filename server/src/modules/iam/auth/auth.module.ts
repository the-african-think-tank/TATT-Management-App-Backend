import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';
import { SecurityModule } from '../../security/security.module';
import { UserSeederService } from './user-seeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        SequelizeModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt', session: false }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('JWT_SECRET');
                const env = config.get<string>('NODE_ENV');
                
                if (!secret) {
                    throw new Error('JWT_SECRET environment variable is not defined.');
                }

                // Extra safety: Prevent placeholder secrets in production
                if (env === 'production' && secret.includes('change_me')) {
                    throw new Error('CRITICAL_SECURITY_ERROR: Using placeholder JWT_SECRET in production.');
                }

                return {
                    secret,
                    signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any },
                } as JwtModuleOptions;
            },
        }),
        SecurityModule, // Provides SecurityPolicyService + TwoFactorService
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserSeederService],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }
