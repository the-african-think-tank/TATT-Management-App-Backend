import { Controller, Get, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RevenueService } from './revenue.service';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Admin — Revenue Center')
@Controller('admin/revenue')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RevenueController {
    constructor(private readonly revenueService: RevenueService) {}

    private checkSuperAdmin(req: any) {
        if (req.user.systemRole !== SystemRole.SUPERADMIN) {
            throw new ForbiddenException('Only superadmins can access this detailed financial information.');
        }
    }

    @Get('metadata')
    @ApiOperation({ summary: 'Get filtering metadata (Chapters, Tiers)' })
    async getMetadata(@Request() req: any) {
        this.checkSuperAdmin(req);
        return this.revenueService.getMetadata();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Revenue dashboard KPIs' })
    async getStats(
        @Request() req: any,
        @Query('chapterId') chapterId?: string,
        @Query('tier') tier?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        this.checkSuperAdmin(req);
        return this.revenueService.getStats({
            chapterId,
            tier,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }

    @Get('trends')
    @ApiOperation({ summary: 'Monthly revenue trends' })
    async getTrends(
        @Request() req: any,
        @Query('chapterId') chapterId?: string,
        @Query('months') months?: string,
    ) {
        this.checkSuperAdmin(req);
        return this.revenueService.getTrends({
            chapterId,
            months: months ? parseInt(months, 10) : 6,
        });
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Paginated transaction history' })
    async getTransactions(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('chapterId') chapterId?: string,
    ) {
        this.checkSuperAdmin(req);
        return this.revenueService.getTransactions({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            search, type, status, chapterId,
        });
    }

    @Get('by-chapter')
    @ApiOperation({ summary: 'Distribution by chapter' })
    async getByChapter(@Request() req: any) {
        this.checkSuperAdmin(req);
        return this.revenueService.getByChapter();
    }
}
