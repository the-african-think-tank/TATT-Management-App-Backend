import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/interests.dto';
import { InterestSchema } from './dto/interests.schemas';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Professional Interests')
@ApiExtraModels(InterestSchema)
@Controller('interests')
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) { }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a new professional interest',
        description: 'Requires ADMIN or SUPERADMIN role. These are used to categorize members and fuel the TATT Connect Recommender.'
    })
    @ApiResponse({ status: 201, description: 'Interest created successfully.', type: InterestSchema })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createInterestDto: CreateInterestDto) {
        return this.interestsService.createInterest(createInterestDto);
    }

    @ApiOperation({
        summary: 'Get all professional interests',
        description: 'Returns the full taxonomy of skills and interests available on the platform.'
    })
    @ApiResponse({ status: 200, description: 'List of interests.', type: [InterestSchema] })
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return this.interestsService.getAllInterests();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a professional interest (Admin only)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: CreateInterestDto) {
        return this.interestsService.updateInterest(id, dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a professional interest (Admin only)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.interestsService.deleteInterest(id);
    }
}
