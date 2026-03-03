import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { ApplyJobDto } from './dto/jobs.dto';

@ApiTags('Jobs / Opportunities')
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List job opportunities with filters and pagination' })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'type', required: false })
    @ApiQuery({ name: 'location', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Paginated job listings.' })
    async getListings(
        @Query('category') category?: string,
        @Query('type') type?: string,
        @Query('location') location?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.jobsService.getListings({
            category,
            type,
            location,
            search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }

    @Get('insights')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Market insights for sidebar' })
    @ApiResponse({ status: 200, description: 'Top category, salary trend, top employers.' })
    async getInsights() {
        return this.jobsService.getMarketInsights();
    }

    @Get('saved')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get saved job listings' })
    @ApiResponse({ status: 200, description: 'List of saved jobs.' })
    async getSaved(@Request() req: any) {
        return this.jobsService.getSavedListings(req.user.id);
    }

    @Get('saved-ids')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get saved job IDs only' })
    @ApiResponse({ status: 200, description: 'Array of job IDs.' })
    async getSavedIds(@Request() req: any) {
        return this.jobsService.getSavedJobIds(req.user.id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a single job by ID' })
    @ApiResponse({ status: 200, description: 'Job details.' })
    @ApiResponse({ status: 404, description: 'Job not found.' })
    async getOne(@Param('id') id: string) {
        return this.jobsService.getListingById(id);
    }

    @Post(':id/apply')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit job application' })
    @ApiResponse({ status: 201, description: 'Application submitted.' })
    @ApiResponse({ status: 400, description: 'Already applied.' })
    async apply(@Param('id') id: string, @Body() dto: ApplyJobDto, @Request() req: any) {
        return this.jobsService.apply(req.user.id, id, dto);
    }

    @Post(':id/save')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle save job (add or remove from saved)' })
    @ApiResponse({ status: 200, description: 'Saved state toggled.' })
    async toggleSave(@Param('id') id: string, @Request() req: any) {
        return this.jobsService.toggleSaved(req.user.id, id);
    }

    @Delete(':id/save')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove job from saved' })
    @ApiResponse({ status: 200, description: 'Removed from saved.' })
    async unsave(@Param('id') id: string, @Request() req: any) {
        await this.jobsService.toggleSaved(req.user.id, id);
        return { message: 'Removed from saved roles.' };
    }
}
