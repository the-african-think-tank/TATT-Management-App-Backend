import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events & Workshops')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new event or workshop (Org Admin/Content Admin only)' })
    @ApiResponse({ status: 201, description: 'Event created successfully and notifications sent.' })
    async create(@Body() createEventDto: CreateEventDto, @Req() req: any) {
        return this.eventsService.createEvent(req.user, createEventDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all published events and workshops' })
    async findAll(@Req() req: any) {
        return this.eventsService.getEvents(req.user);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get detailed information for a specific event' })
    async findOne(@Param('id') id: string) {
        return this.eventsService.getEvent(id);
    }

    @Post(':id/register')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Register a community member or business for an event' })
    @ApiResponse({ status: 200, description: 'Registration successful. Returns checkoutUrl if payment is required.' })
    async register(@Param('id') id: string, @Body() registerDto: RegisterEventDto, @Req() req: any) {
        return this.eventsService.register(req.user, id, registerDto);
    }
}
