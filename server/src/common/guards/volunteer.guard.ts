import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../modules/iam/entities/user.entity';
import { AccountFlags, SystemRole } from '../../modules/iam/enums/roles.enum';

@Injectable()
export class VolunteerGuard implements CanActivate {
    constructor(
        @InjectModel(User) private userRepo: typeof User,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) return false;

        // Staff always pass
        const isStaff = [SystemRole.SUPERADMIN, SystemRole.ADMIN, SystemRole.VOLUNTEER_ADMIN].includes(user.systemRole);
        if (isStaff) return true;

        // Reload fresh from DB
        const dbUser = await this.userRepo.findByPk(user.id, {
            attributes: ['flags'],
            raw: true,
        });

        const flags = dbUser?.['flags'] as string | string[] | undefined;
        let hasFlag = false;

        if (Array.isArray(flags)) {
            hasFlag = flags.includes(AccountFlags.VOLUNTEER) || flags.includes('VOLUNTEER');
        } else if (typeof flags === 'string') {
            // Postgres literal array format check: {FLAG1,FLAG2}
            hasFlag = flags.includes('VOLUNTEER');
        }

        if (hasFlag) return true;

        throw new ForbiddenException('This endpoint is restricted to approved TATT Volunteers.');
    }
}
