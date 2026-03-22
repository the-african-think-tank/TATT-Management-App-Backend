import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) { }

    @Get()
    @Roles(SystemRole.SUPERADMIN, SystemRole.ADMIN)
    async findAll() {
        return this.settingsService.findAll();
    }

    @Put(':key')
    @Roles(SystemRole.SUPERADMIN, SystemRole.ADMIN)
    async update(
        @Param('key') key: string,
        @Body() body: { value: string; category?: string; description?: string, isSecret?: boolean },
    ) {
        return this.settingsService.update(key, body.value, body.category || 'GENERAL', body.description, body.isSecret);
    }
    
    @Delete(':key')
    @Roles(SystemRole.SUPERADMIN)
    async remove(@Param('key') key: string) {
        return this.settingsService.remove(key);
    }

    @Post('test-smtp')
    @Roles(SystemRole.SUPERADMIN)
    async testSmtp(@Body('email') email: string) {
        return this.settingsService.testSmtpConnection(email);
    }
}
