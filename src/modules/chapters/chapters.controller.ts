import { Controller, Post, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/chapters.dto';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Chapters')
@Controller('chapters')
export class ChaptersController {
    constructor(private readonly chaptersService: ChaptersService) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new chapter' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createChapterDto: CreateChapterDto) {
        return this.chaptersService.createChapter(createChapterDto);
    }

    // Public or auth guard if needed
    @ApiOperation({ summary: 'Get all chapters' })
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return this.chaptersService.getAllChapters();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update regional manager for a chapter' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch(':id/manager')
    async updateManager(@Param('id') id: string, @Body('managerId') managerId: string) {
        return this.chaptersService.updateChapterManager(id, managerId);
    }
}
