import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TermsService } from './terms.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@Controller('terms')
export class TermsController {
    constructor(
        private readonly termsService: TermsService,
    ) {}

    /** Public: get currently active Terms of Service */
    @Get('active')
    getActive() {
        return this.termsService.getActive();
    }

    /** Admin: get full version history */
    @Get('history')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.SUPERADMIN, SystemRole.ADMIN)
    findAll() {
        return this.termsService.findAll();
    }

    /** Admin: get a specific version by ID */
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.SUPERADMIN, SystemRole.ADMIN)
    findById(@Param('id') id: string) {
        return this.termsService.findById(id);
    }

    /**
     * Admin: Publish a new version of the ToS.
     * Automatically archives the previous version and broadcasts notifications.
     */
    @Post('publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.SUPERADMIN, SystemRole.ADMIN)
    publish(@Request() req: any, @Body('content') content: string) {
        return this.termsService.publish(req.user.id, content);
    }
}
