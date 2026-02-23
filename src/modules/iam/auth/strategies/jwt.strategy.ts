import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
        });
    }

    async validate(payload: any) {
        // For advanced security, we load full partial state dynamically to feed Guards (SuspensionGuard & RolesGuard)
        const user = await this.userRepository.findByPk(payload.sub, {
            attributes: ['id', 'email', 'systemRole', 'communityTier', 'suspensionStrikes', 'jailUntil', 'jailReason', 'isActive'],
        });

        if (!user) {
            throw new UnauthorizedException('User trace not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is not perfectly active');
        }

        // Attach to context as req.user
        return user;
    }
}
