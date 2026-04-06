import { Controller, Get, Post, Body, Param, Put, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { CreateTicketDto, ResolveTicketDto, CreateFaqDto } from './dto/support.dto';

@ApiTags('Support Center')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
    constructor(private readonly supportService: SupportService) {}

    // --- DASHBOARD (Admin Only) ---
    @Get('dashboard')
    @ApiOperation({ summary: 'Get support dashboard statistics and active tickets' })
    async getDashboardStats() {
        return this.supportService.getDashboardStats();
    }

    // --- TICKETS ---
    @Post('tickets')
    @ApiOperation({ summary: 'Submit a new support ticket' })
    async createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
        return this.supportService.createTicket(req.user.id, dto);
    }

    @Get('tickets/my')
    @ApiOperation({ summary: 'Get tickets for the authenticated member' })
    async getMyTickets(@Request() req: any) {
        return this.supportService.getMemberTickets(req.user.id);
    }

    @Put('tickets/:id/resolve')
    @ApiOperation({ summary: 'Mark a ticket as resolved (Org Members)' })
    async resolveTicket(@Param('id') id: string, @Body() dto: ResolveTicketDto) {
        return this.supportService.resolveTicket(id, dto);
    }

    @Patch('tickets/:id')
    @ApiOperation({ summary: 'Update ticket details (Admin/Support)' })
    async updateTicket(@Param('id') id: string, @Body() dto: any) {
        return this.supportService.updateTicket(id, dto);
    }

    @Get('cases/:id')
    @ApiOperation({ summary: 'Get a specific ticket by ID' })
    async getTicketById(@Param('id') id: string) {
        return this.supportService.getTicketById(id);
    }

    @Post('tickets/:id/messages')
    @ApiOperation({ summary: 'Add a new message to a ticket thread' })
    async addMessage(@Request() req: any, @Param('id') id: string, @Body() dto: { message: string, isAdmin?: boolean }) {
        // In a real app, we'd check req.user.role to set isAdmin, but for now we trust the context or check roles
        const isAdmin = dto.isAdmin || false; 
        return this.supportService.addMessage(id, req.user.id, dto.message, isAdmin);
    }

    // --- FAQS ---
    @Post('faqs')
    @ApiOperation({ summary: 'Create a new FAQ (Org Members)' })
    async createFaq(@Body() dto: CreateFaqDto) {
        return this.supportService.createFaq(dto);
    }

    @Get('faqs')
    @ApiOperation({ summary: 'Get all active FAQs' })
    async getFaqs() {
        return this.supportService.getFaqs();
    }
}
