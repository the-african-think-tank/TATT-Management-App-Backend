import { Controller, Get, Post, Param, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all user notifications' })
    async findAll(@Req() req: any) {
        return this.notificationsService.findAll(req.user.id);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    async markAsRead(@Req() req: any, @Param('id') id: string) {
        return this.notificationsService.markAsRead(req.user.id, id);
    }

    @Patch(':id/dismiss')
    @ApiOperation({ summary: 'Dismiss a notification' })
    async dismiss(@Req() req: any, @Param('id') id: string) {
        return this.notificationsService.dismiss(req.user.id, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    async delete(@Req() req: any, @Param('id') id: string) {
        return this.notificationsService.delete(req.user.id, id);
    }
}
