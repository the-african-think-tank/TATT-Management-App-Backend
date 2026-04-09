import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole, AccountFlags } from '../../modules/iam/enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }
        
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const url = request.url;
        
        if (!user) return false;

        // SuperAdmin gets universal bypass
        if (user.systemRole === SystemRole.SUPERADMIN) {
            return true;
        }

        // Module URL flag overrides
        const flags = user.flags || [];
        if (url.includes('/volunteers') && flags.includes(AccountFlags.CAN_ACCESS_VOLUNTEER_CENTER)) return true;
        if (url.includes('/events') && flags.includes(AccountFlags.CAN_ACCESS_EVENTS)) return true;
        if (url.includes('/chapters') && flags.includes(AccountFlags.CAN_ACCESS_REGIONAL_CHAPTERS)) return true;
        if (url.includes('/feed') && flags.includes(AccountFlags.CAN_ACCESS_FORUM_MODERATION)) return true;
        if (url.includes('/partnerships') && flags.includes(AccountFlags.CAN_ACCESS_PARTNERSHIPS)) return true;
        if (url.includes('/membership') && flags.includes(AccountFlags.CAN_ACCESS_MEMBERSHIP_CENTER)) return true;
        if (url.includes('/resources') && flags.includes(AccountFlags.CAN_ACCESS_CONTENT_RESOURCES)) return true;
        if ((url.includes('/store') || url.includes('/inventory') || url.includes('/sales')) && flags.includes(AccountFlags.CAN_ACCESS_SALES_INVENTORY)) return true;
        if (url.includes('/analytics') && flags.includes(AccountFlags.CAN_ACCESS_ANALYTICS)) return true;
        if ((url.includes('/org-management') || url.includes('/users')) && flags.includes(AccountFlags.CAN_ACCESS_ORG_MANAGEMENT)) return true;

        if (!requiredRoles) {
            return true;
        }

        return requiredRoles.includes(user.systemRole);
    }
}
