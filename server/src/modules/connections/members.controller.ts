import {
    Controller,
    Get,
    Query,
    Param,
    ParseUUIDPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { MemberSearchQueryDto } from './dto/member-directory.dto';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { MemberSummarySchema } from './dto/connection.dto';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('members')
export class MembersController {
    constructor(private readonly connectionsService: ConnectionsService) { }

    @ApiOperation({
        summary: 'Get all active members (Directory)',
        description: 'Returns a paginated list of all active community members. Supports filtering by chapter, industry, and text search.',
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of members.',
        schema: {
            properties: {
                members: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MemberSummarySchema' },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalPages: { type: 'number' },
                    },
                },
            },
        },
    })
    @Get()
    async findAll(@Request() req, @Query() query: MemberSearchQueryDto) {
        return this.connectionsService.getAllMembers(query, req.user?.id);
    }

    @ApiOperation({
        summary: 'Get a member public profile',
        description: 'Returns the public profile of a specific active community member by their ID.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the member',
        format: 'uuid',
        example: 'b2c9f1a0-4e8d-4f71-bf14-01e23f4a5678',
    })
    @ApiResponse({ status: 200, description: 'Member profile.' })
    @ApiResponse({ status: 404, description: 'Member not found.' })
    @Get(':id')
    async getProfile(@Param('id', ParseUUIDPipe) id: string) {
        return this.connectionsService.getMemberProfile(id);
    }
}
