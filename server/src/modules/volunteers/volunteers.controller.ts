import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { VolunteersService } from './volunteers.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { VolunteerGuard } from '../../common/guards/volunteer.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';
import {
    CreateVolunteerRoleDto,
    ApplyVolunteerDto,
    UpdateApplicationStatusDto,
    CreateActivityDto,
    UpdateActivityStatusDto,
    CreateTrainingResourceDto
} from './dto/volunteers.dto';
import {
    VolunteerRoleSchema,
    VolunteerApplicationSchema,
    VolunteerActivitySchema,
    VolunteerStatSchema,
    TrainingResourceSchema,
    VolunteerMessageResponseSchema,
} from './dto/volunteers.schemas';

@ApiTags('Volunteers & Impact')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized — Token missing or invalid' })
@ApiResponse({ status: 403, description: 'Forbidden — Insufficient permissions' })
@UseGuards(JwtAuthGuard)
@ApiExtraModels(
    VolunteerRoleSchema,
    VolunteerApplicationSchema,
    VolunteerActivitySchema,
    VolunteerStatSchema,
    TrainingResourceSchema,
    VolunteerMessageResponseSchema,
)
@Controller('volunteers')
export class VolunteersController {
    constructor(private readonly volunteersService: VolunteersService) { }

    // ─── PUBLIC / MEMBER ENDPOINTS ─────────────────────────────────────────────

    @ApiOperation({
        summary: 'Get all active volunteer roles',
        description: 'Retrieves current open positions for volunteers. Can be filtered by chapter.'
    })
    @ApiResponse({ status: 200, type: [VolunteerRoleSchema] })
    @Get('roles')
    async getRoles(@Query('chapterId') chapterId?: string) {
        return this.volunteersService.getActiveRoles(chapterId);
    }

    @ApiOperation({
        summary: 'Apply to be a volunteer',
        description: 'Community members can apply for specific roles or submit a general application.'
    })
    @ApiResponse({ status: 201, type: VolunteerApplicationSchema })
    @Post('apply')
    @HttpCode(HttpStatus.CREATED)
    async apply(@Request() req, @Body() dto: ApplyVolunteerDto) {
        return this.volunteersService.apply(req.user.id, dto);
    }

    @ApiOperation({
        summary: 'Get my volunteer applications',
        description: 'Returns all volunteer applications submitted by the currently logged-in user.'
    })
    @ApiResponse({ status: 200, type: [VolunteerApplicationSchema] })
    @Get('my-applications')
    async getMyApplications(@Request() req) {
        return this.volunteersService.getMyApplications(req.user.id);
    }

    // ─── VOLUNTEER ENDPOINTS ───────────────────────────────────────────────────

    @ApiOperation({
        summary: 'Get assigned activities',
        description: 'Fetch all tasks assigned to the currently logged-in volunteer.'
    })
    @ApiResponse({ status: 200, type: [VolunteerActivitySchema] })
    @UseGuards(VolunteerGuard)
    @Get('my-activities')
    async getMyActivities(@Request() req) {
        return this.volunteersService.getVolunteerActivities(req.user.id);
    }

    @ApiOperation({
        summary: 'Update activity status',
        description: 'Mark an activity as COMPLETED or DECLINED. Completing activities awards points.'
    })
    @ApiResponse({ status: 200, type: VolunteerMessageResponseSchema })
    @UseGuards(VolunteerGuard)
    @Patch('activities/:id/status')
    async updateActivityStatus(@Request() req, @Param('id') id: string, @Body() dto: UpdateActivityStatusDto) {
        return this.volunteersService.updateActivityStatus(req.user.id, id, dto);
    }

    @ApiOperation({
        summary: 'Get training resources',
        description: 'Access educational materials and guides available to the volunteer community.'
    })
    @ApiResponse({ status: 200, type: [TrainingResourceSchema] })
    @UseGuards(VolunteerGuard)
    @Get('training')
    async getTraining() {
        return this.volunteersService.getTrainingResources();
    }

    @ApiOperation({ summary: 'Get volunteer stats' })
    @ApiResponse({ status: 200, type: VolunteerStatSchema })
    @Get('stats')
    async getStats(@Request() req) {
        return this.volunteersService.getStats(req.user.id);
    }

    // ─── VOLUNTEER ADMIN ENDPOINTS ─────────────────────────────────────────────

    @ApiOperation({ summary: 'Create a new volunteer role (Admin)' })
    @ApiResponse({ status: 201, type: VolunteerRoleSchema })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.VOLUNTEER_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('roles')
    async createRole(@Request() req, @Body() dto: CreateVolunteerRoleDto) {
        return this.volunteersService.createRole(req.user.id, dto);
    }

    @ApiOperation({ summary: 'Close a volunteer role (Admin)' })
    @ApiResponse({ status: 200, type: VolunteerMessageResponseSchema })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.VOLUNTEER_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('roles/:id/close')
    async closeRole(@Param('id') id: string) {
        return this.volunteersService.closeRole(id);
    }

    @ApiOperation({ summary: 'Get all applications (Admin)' })
    @ApiResponse({ status: 200, type: [VolunteerApplicationSchema] })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.VOLUNTEER_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('applications')
    async getApplications(@Request() req, @Query('roleId') roleId?: string) {
        return this.volunteersService.getApplications(req.user.id, roleId);
    }

    @ApiOperation({ summary: 'Review/Approve application (Admin)' })
    @ApiResponse({ status: 200, type: VolunteerMessageResponseSchema })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.VOLUNTEER_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('applications/:id/status')
    async reviewApplication(@Request() req, @Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
        return this.volunteersService.updateApplicationStatus(req.user.id, id, dto);
    }

    @ApiOperation({ summary: 'Create volunteer activity (Admin)' })
    @ApiResponse({ status: 201, type: VolunteerActivitySchema })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.VOLUNTEER_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('activities')
    async createActivity(@Request() req, @Body() dto: CreateActivityDto) {
        return this.volunteersService.createActivity(req.user.id, dto);
    }

    @ApiOperation({ summary: 'Create training resource (Admin)' })
    @ApiResponse({ status: 201, type: TrainingResourceSchema })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.VOLUNTEER_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('training')
    async createTraining(@Request() req, @Body() dto: CreateTrainingResourceDto) {
        return this.volunteersService.createTrainingResource(req.user.id, dto);
    }
}
