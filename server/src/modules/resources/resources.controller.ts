import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, ParseUUIDPipe,
    UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiBearerAuth,
    ApiParam, ApiQuery, ApiResponse, ApiExtraModels,
} from '@nestjs/swagger';
import { ResourceType } from './entities/resource.entity';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto, ResourceListQueryDto } from './dto/resources.dto';
import {
    ResourceCardSchema, ResourceDetailSchema,
    ResourcesListResponseSchema, ResourceDetailResponseSchema,
    CreateResourceResponseSchema, UpdateResourceResponseSchema,
    DeleteResourceResponseSchema,
} from './dto/resources.schemas';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Knowledge & Resource Hub')
@ApiBearerAuth()
@ApiExtraModels(
    ResourceCardSchema, ResourceDetailSchema,
    ResourcesListResponseSchema, ResourceDetailResponseSchema,
    CreateResourceResponseSchema, UpdateResourceResponseSchema, DeleteResourceResponseSchema,
    CreateResourceDto, UpdateResourceDto, ResourceListQueryDto,
)
@Controller('resources')
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    // ═══════════════════════════════════════════════════════════════════════════
    //  ADMIN — Create, Update, Delete
    // ═══════════════════════════════════════════════════════════════════════════

    @ApiOperation({
        summary: 'Create a resource',
        description:
            '**Content Admin only** (CONTENT_ADMIN, ADMIN, SUPERADMIN). Creates a new resource with visibility and minTier. ' +
            'Visibility: PUBLIC = card visible to everyone in list; RESTRICTED = only eligible tier (and chapter if set) sees card. ' +
            'minTier defines the minimum membership tier required to access details/contentUrl.',
    })
    @ApiResponse({ status: 201, description: 'Resource created.', type: CreateResourceResponseSchema })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.CONTENT_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateResourceDto, @Request() req: { user: { id: string } }) {
        return this.resourcesService.create(dto, req.user as any);
    }

    @ApiOperation({
        summary: 'Update a resource',
        description: '**Content Admin only.** Updates metadata or access rules (visibility, minTier, chapterId, etc.).',
    })
    @ApiParam({ name: 'id', format: 'uuid', description: 'Resource UUID' })
    @ApiResponse({ status: 200, description: 'Resource updated.', type: UpdateResourceResponseSchema })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @ApiResponse({ status: 404, description: 'Resource not found.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.CONTENT_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateResourceDto,
        @Request() req: { user: { id: string } },
    ) {
        return this.resourcesService.update(id, dto, req.user as any);
    }

    @ApiOperation({
        summary: 'Archive a resource (soft-delete)',
        description: '**Content Admin only.** Soft-deletes the resource; it no longer appears in lists.',
    })
    @ApiParam({ name: 'id', format: 'uuid', description: 'Resource UUID' })
    @ApiResponse({ status: 200, description: 'Resource archived.', type: DeleteResourceResponseSchema })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @ApiResponse({ status: 404, description: 'Resource not found.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.CONTENT_ADMIN, SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: { id: string } }) {
        return this.resourcesService.remove(id, req.user as any);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  MEMBER — List and Get (visibility & access gated)
    // ═══════════════════════════════════════════════════════════════════════════

    @ApiOperation({
        summary: 'List resources (visibility-gated)',
        description:
            'Returns a paginated list of resources the **current user is allowed to see**.\n\n' +
            '**Visibility (listing):**\n' +
            '| Rule | Who sees the card |\n|------|-------------------|\n' +
            '| `PUBLIC` | Everyone |\n' +
            '| `RESTRICTED` | Only if user\'s `communityTier` ≥ resource `minTier` and (if resource has `chapterId`) user belongs to that chapter |\n\n' +
            'Query params: `type`, `chapterId`, `tag` filter the result set.',
    })
    @ApiQuery({ name: 'type', enum: ResourceType, required: false, description: 'Filter by resource type' })
    @ApiQuery({ name: 'chapterId', required: false, description: 'Filter by chapter UUID' })
    @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag (e.g. Legal, Tech)' })
    @ApiQuery({ name: 'page', type: Number, required: false, example: 1, description: 'Page number (1-based)' })
    @ApiQuery({ name: 'limit', type: Number, required: false, example: 20, description: 'Results per page (1–50)' })
    @ApiResponse({ status: 200, description: 'Paginated list of resource cards.', type: ResourcesListResponseSchema })
    @UseGuards(JwtAuthGuard)
    @Get()
    async list(@Query() query: ResourceListQueryDto, @Request() req: { user: { id: string } }) {
        return this.resourcesService.list(req.user as any, query);
    }

    @ApiOperation({
        summary: 'Get resource by ID (access-gated)',
        description:
            'Returns full details including `contentUrl` **only if access rules are met**.\n\n' +
            '**Access (view/read/activate):** User must have `communityTier` ≥ resource `minTier` and (if resource has `chapterId`) belong to that chapter. ' +
            'If not met, returns **403** with message: *"Your current membership does not include access to this [Type]. Upgrade to [minTier] to unlock."*',
    })
    @ApiParam({ name: 'id', format: 'uuid', description: 'Resource UUID' })
    @ApiResponse({ status: 200, description: 'Resource details and contentUrl.', type: ResourceDetailResponseSchema })
    @ApiResponse({ status: 403, description: 'Tier or chapter does not meet resource access rules.', schema: { properties: { statusCode: { type: 'integer', example: 403 }, message: { type: 'string', example: 'Your current membership does not include access to this Guide. Upgrade to UBUNTU to unlock.' } } } })
    @ApiResponse({ status: 404, description: 'Resource not found.' })
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getById(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: { id: string } }) {
        return this.resourcesService.getById(id, req.user as any);
    }
}
