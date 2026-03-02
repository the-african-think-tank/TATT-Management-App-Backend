import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SystemRole } from '../../modules/iam/enums/roles.enum';

@Injectable()
export class SuspensionGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            return true; // Authentication handled elsewhere
        }

        // SuperAdmin ignores bans contextually for admin routes, but 
        if (user.suspensionStrikes >= 3) {
            throw new ForbiddenException(
                'Your account has been permanently suspended due to repeated violations.',
            );
        }

        if (user.jailUntil && new Date(user.jailUntil) > new Date()) {
            throw new ForbiddenException(
                `Account access temporarily restricted until ${new Date(user.jailUntil).toISOString()}. Reason: ${user.jailReason || 'Policy Violation'}`,
            );
        }

        return true;
    }
}
