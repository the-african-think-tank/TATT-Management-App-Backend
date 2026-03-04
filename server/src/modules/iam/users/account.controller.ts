import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
    constructor(private readonly usersService: UsersService) { }

    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile details returned.' })
    @Get('profile')
    async getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.id);
    }

    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
    @Patch('profile')
    async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }

    @ApiOperation({ summary: 'Request account deletion' })
    @ApiResponse({ status: 200, description: 'Account scheduled for deletion.' })
    @Patch('request-deletion')
    async requestDeletion(@Request() req) {
        return this.usersService.requestDeletion(req.user.id);
    }

    @ApiOperation({ summary: 'Cancel account deletion request' })
    @ApiResponse({ status: 200, description: 'Account deletion request cancelled.' })
    @Patch('cancel-deletion')
    async cancelDeletion(@Request() req) {
        return this.usersService.cancelDeletion(req.user.id);
    }
}
