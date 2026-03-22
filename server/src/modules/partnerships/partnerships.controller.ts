import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { PartnershipService } from './partnerships.service';
import { CreatePartnershipDto, UpdatePartnershipDto } from './dto/partnership.dto';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Promotions & Partnerships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('partnerships')
export class PartnershipController {
    constructor(private readonly partnershipService: PartnershipService) { }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /partnerships
    // ──────────────────────────────────────────────────────────────────────────
    @Post()
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiOperation({
        summary: 'Create a new corporate partnership',
        description:
            'Registers a new partner organisation in the TATT Benefits Hub. Each partnership is ' +
            'tied to specific membership tiers via `tierAccess` and can optionally define per-tier ' +
            'quota caps in `tierQuotas`. Only ADMIN and SUPERADMIN roles may create partnerships.',
    })
    @ApiBody({ type: CreatePartnershipDto })
    @ApiResponse({
        status: 201,
        description: 'Partnership created successfully.',
        schema: {
            example: {
                id: 'a3f1c2d4-...',
                name: 'Global Sky Airways',
                email: 'partnerships@globalsky.com',
                category: 'Travel & Logistics',
                tierAccess: ['UBUNTU', 'IMANI', 'KIONGOZI'],
                quotaAmount: 25,
                quotaUsed: 0,
                status: 'ACTIVE',
                logoUrl: 'https://example.com/logo.png',
                description: 'Full global travel benefits for Kiongozi members.',
                website: 'https://corporation.com',
                buttonLabel: 'Get Access',
                redemptionLink: 'https://benefithub.com/redeem',
                contactName: 'John M',
                contactPosition: 'Manager',
                quotaReset: 'MONTHLY',
                tierQuotas: { UBUNTU: 10, IMANI: 50, KIONGOZI: null },
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Validation failed — check request body fields.' })
    @ApiResponse({ status: 401, description: 'Unauthorized — bearer token missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden — insufficient role privileges.' })
    async create(@Body() dto: CreatePartnershipDto) {
        try {
            console.log('[PartnershipController] CREATE - Body:', JSON.stringify(dto, null, 2));
            return await this.partnershipService.create(dto);
        } catch (error) {
            console.error('[PartnershipController] Create error:', error);
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /partnerships
    // ──────────────────────────────────────────────────────────────────────────
    @Get()
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.SALES)
    @ApiOperation({
        summary: 'List all partnerships',
        description:
            'Returns a filtered list of all partner organisations. Supports optional query filters ' +
            'for `search` (name / email fuzzy match), `category`, and `status`. ' +
            'Accessible by ADMIN, SUPERADMIN, and SALES roles.',
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Case-insensitive partial match on partner name or email.',
        example: 'Global Sky',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        type: String,
        description: 'Exact category filter (e.g. "Travel & Logistics", "Finance", "Health").',
        example: 'Finance',
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['ACTIVE', 'INACTIVE'],
        description: 'Filter by partnership status.',
    })
    @ApiResponse({
        status: 200,
        description: 'Array of partnership objects matching the applied filters.',
        schema: {
            example: [
                {
                    id: 'a3f1c2d4-...',
                    name: 'Global Sky Airways',
                    category: 'Travel & Logistics',
                    status: 'ACTIVE',
                    tierAccess: ['UBUNTU', 'IMANI', 'KIONGOZI'],
                    quotaAmount: 25,
                    quotaUsed: 7,
                    quotaReset: 'MONTHLY',
                },
            ],
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll(@Query() query: any) {
        return this.partnershipService.findAll(query);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /partnerships/my-benefits
    // ──────────────────────────────────────────────────────────────────────────
    @Get('my-benefits')
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.COMMUNITY_MEMBER)
    @ApiOperation({
        summary: 'Get partnerships available to the authenticated member',
        description:
            'Returns the full partnership catalogue enriched with an `isLocked` flag that ' +
            'indicates whether the currently authenticated member qualifies for each benefit ' +
            'based on their community tier (e.g. FREE, UBUNTU, IMANI, KIONGOZI). ' +
            'Locked partnerships are still returned so the front-end can render upgrade prompts.',
    })
    @ApiResponse({
        status: 200,
        description: 'Enriched partnership list with per-member lock status.',
        schema: {
            example: [
                {
                    id: 'a3f1c2d4-...',
                    name: 'Global Sky Airways',
                    category: 'Travel & Logistics',
                    tierAccess: ['IMANI', 'KIONGOZI'],
                    isLocked: true,
                },
                {
                    id: 'b7e2a1f9-...',
                    name: 'HealthBridge Africa',
                    category: 'Health & Wellness',
                    tierAccess: ['UBUNTU', 'IMANI', 'KIONGOZI'],
                    isLocked: false,
                },
            ],
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getMyBenefits(@Request() req: any) {
        const user = req.user;
        const partnerships = await this.partnershipService.findAll({});

        return partnerships.map(p => {
            const isAvailable = p.tierAccess.includes(user.communityTier || 'FREE');
            return {
                ...p.toJSON(),
                isLocked: !isAvailable,
            };
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /partnerships/stats
    // ──────────────────────────────────────────────────────────────────────────
    @Get('stats')
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiOperation({
        summary: 'Get partnership hub statistics',
        description:
            'Returns aggregated metrics for the partnerships hub dashboard, including total and ' +
            'active partnership counts, the number of partners supporting the KIONGOZI tier, ' +
            'and aggregate quota allocation vs usage across all partnerships.',
    })
    @ApiResponse({
        status: 200,
        description: 'Aggregated partnership statistics.',
        schema: {
            example: {
                totalCount: 14,
                activeCount: 11,
                kiongoziSupportCount: 6,
                quotaStats: {
                    totalQuota: 450,
                    totalUsed: 132,
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden — ADMIN / SUPERADMIN only.' })
    getStats() {
        return this.partnershipService.getStats();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /partnerships/:id
    // ──────────────────────────────────────────────────────────────────────────
    @Get(':id')
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.SALES, SystemRole.COMMUNITY_MEMBER)
    @ApiOperation({
        summary: 'Get details of a specific partnership',
        description:
            'Fetches a single partnership by its UUID. When called by a COMMUNITY_MEMBER, the ' +
            'response is enriched with `currentTierQuota` (the quota allocated to that member\'s ' +
            'tier) and `isLocked` (whether the benefit is accessible at their current tier).',
    })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID of the partnership.',
        example: 'a3f1c2d4-7b8e-4f2a-9c1d-0e5f6a7b8c9d',
    })
    @ApiResponse({
        status: 200,
        description: 'Partnership details. Community members receive additional tier-specific fields.',
        schema: {
            example: {
                id: 'a3f1c2d4-...',
                name: 'Global Sky Airways',
                email: 'partnerships@globalsky.com',
                category: 'Travel & Logistics',
                tierAccess: ['UBUNTU', 'IMANI', 'KIONGOZI'],
                quotaAmount: 50,
                quotaUsed: 12,
                status: 'ACTIVE',
                logoUrl: 'https://example.com/logo.png',
                description: 'Full global travel benefits.',
                website: 'https://corporation.com',
                buttonLabel: 'Get Access',
                redemptionLink: 'https://benefithub.com/redeem',
                contactName: 'John M',
                contactPosition: 'Manager',
                quotaReset: 'MONTHLY',
                tierQuotas: { UBUNTU: 10, IMANI: 25, KIONGOZI: null },
                currentTierQuota: 25,
                isLocked: false,
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Partnership not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user;
        const partnership = await this.partnershipService.findOne(id);

        if (user.systemRole === 'COMMUNITY_MEMBER') {
            const userTier = user.communityTier || 'FREE';
            const tierQuota = (partnership as any).tierQuotas?.[userTier] ?? 0;

            return {
                ...(partnership as any).toJSON(),
                currentTierQuota: tierQuota,
                isLocked: !(partnership as any).tierAccess.includes(userTier),
            };
        }

        return partnership;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PATCH /partnerships/:id
    // ──────────────────────────────────────────────────────────────────────────
    @Patch(':id')
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiOperation({
        summary: 'Update an existing partnership',
        description:
            'Performs a partial update on a partnership record. All fields from `CreatePartnershipDto` ' +
            'are optional. Additionally accepts `quotaUsed` to manually adjust the quota ' +
            'consumption counter (e.g. after a sync with an external redemption platform).',
    })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID of the partnership to update.',
        example: 'a3f1c2d4-7b8e-4f2a-9c1d-0e5f6a7b8c9d',
    })
    @ApiBody({ type: UpdatePartnershipDto })
    @ApiResponse({
        status: 200,
        description: 'Updated partnership record.',
        schema: {
            example: {
                id: 'a3f1c2d4-...',
                name: 'Global Sky Airways',
                status: 'INACTIVE',
                quotaUsed: 30,
                updatedAt: '2025-06-01T12:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @ApiResponse({ status: 404, description: 'Partnership not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async update(@Param('id') id: string, @Body() dto: UpdatePartnershipDto) {
        try {
            console.log('[PartnershipController] UPDATE - Body:', JSON.stringify(dto, null, 2));
            return await this.partnershipService.update(id, dto);
        } catch (error) {
            console.error('[PartnershipController] Update error:', error);
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE /partnerships/:id
    // ──────────────────────────────────────────────────────────────────────────
    @Delete(':id')
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiOperation({
        summary: 'Remove a partnership',
        description:
            'Permanently deletes a partnership from the Benefits Hub. This action is irreversible. ' +
            'Consider setting status to INACTIVE instead for soft-disabling a partner.',
    })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID of the partnership to delete.',
        example: 'a3f1c2d4-7b8e-4f2a-9c1d-0e5f6a7b8c9d',
    })
    @ApiResponse({
        status: 200,
        description: 'Partnership removed successfully.',
        schema: {
            example: { message: 'Partnership removed successfully' },
        },
    })
    @ApiResponse({ status: 404, description: 'Partnership not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden — ADMIN / SUPERADMIN only.' })
    remove(@Param('id') id: string) {
        return this.partnershipService.remove(id);
    }
}
