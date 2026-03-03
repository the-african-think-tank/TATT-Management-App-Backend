import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiExtraModels, ApiParam } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/chapters.dto';
import { ChapterSchema } from './dto/chapters.schemas';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Chapters')
@ApiExtraModels(ChapterSchema)
@Controller('chapters')
export class ChaptersController {
    constructor(private readonly chaptersService: ChaptersService) { }

    @ApiOperation({
        summary: 'Get all chapters',
        description: 'Returns a list of all active TATT chapters and their regional managers.'
    })
    @ApiResponse({ status: 200, description: 'List of chapters.', type: [ChapterSchema] })
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return this.chaptersService.getAllChapters();
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get chapter members',
        description: 'Returns members of a chapter (for directory / My Chapter sidebar).'
    })
    @ApiParam({ name: 'id', format: 'uuid', description: 'Chapter UUID' })
    @ApiResponse({ status: 200, description: 'List of members (id, firstName, lastName, profilePicture, professionTitle).' })
    @ApiResponse({ status: 404, description: 'Chapter not found.' })
    @UseGuards(JwtAuthGuard)
    @Get(':id/members')
    async getMembers(@Param('id') id: string, @Request() req) {
        return this.chaptersService.getChapterMembers(id, req.user?.id);
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get chapter by ID',
        description: 'Returns a single chapter with regional manager details. Used for My Chapter dashboard.'
    })
    @ApiParam({ name: 'id', format: 'uuid', description: 'Chapter UUID' })
    @ApiResponse({ status: 200, description: 'Chapter details.', type: ChapterSchema })
    @ApiResponse({ status: 404, description: 'Chapter not found.' })
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.chaptersService.getChapterById(id);
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a new chapter',
        description: 'Requires ADMIN or SUPERADMIN role. Chapters organize members by regional geographic area.'
    })
    @ApiResponse({ status: 201, description: 'Chapter created successfully.', type: ChapterSchema })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createChapterDto: CreateChapterDto) {
        return this.chaptersService.createChapter(createChapterDto);
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update regional manager for a chapter',
        description: 'Assigns a user (by UUID) as the regional manager for a specific chapter.'
    })
    @ApiResponse({ status: 200, description: 'Manager assigned.' })
    @ApiResponse({ status: 404, description: 'Chapter or User not found.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch(':id/manager')
    async updateManager(@Param('id') id: string, @Body('managerId') managerId: string) {
        return this.chaptersService.updateChapterManager(id, managerId);
    }
}

