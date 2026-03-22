import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BroadcastsService } from '../services/broadcasts.service';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { SystemRole } from '../../iam/enums/roles.enum';

@ApiTags('Admin-Broadcasts')
@Controller('admin/broadcasts')
export class BroadcastsController {
    constructor(private readonly broadcastsService: BroadcastsService) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new admin broadcast' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post()
    async create(@Body() dto: any, @Request() req) {
        return this.broadcastsService.createBroadcast(req.user.id, dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all admin broadcasts' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get()
    async findAll() {
        return this.broadcastsService.getBroadcasts();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an admin broadcast' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.broadcastsService.deleteBroadcast(id);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Manually trigger a broadcast send' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post(':id/send')
    async send(@Param('id') id: string) {
        return this.broadcastsService.sendBroadcast(id);
    }
}
