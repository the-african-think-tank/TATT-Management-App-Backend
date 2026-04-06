import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IndustriesService } from './industries.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Platform Taxonomy: Industries')
@Controller('industries')
export class IndustriesController {
    constructor(private readonly industriesService: IndustriesService) {}

    @Get()
    @ApiOperation({ summary: 'Get all platform industries' })
    async findAll() {
        return this.industriesService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new industry (Admin Only)' })
    async create(@Body('name') name: string) {
        return this.industriesService.create(name);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an industry (Admin Only)' })
    async update(@Param('id') id: string, @Body('name') name: string) {
        return this.industriesService.update(id, name);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an industry (Admin Only)' })
    async delete(@Param('id') id: string) {
        return this.industriesService.delete(id);
    }
}
