import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/interests.dto';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Professional Interests')
@Controller('interests')
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new professional interest' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createInterestDto: CreateInterestDto) {
        return this.interestsService.createInterest(createInterestDto);
    }

    // Public or auth guard if needed (since users need to see them to register)
    @ApiOperation({ summary: 'Get all professional interests' })
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return this.interestsService.getAllInterests();
    }
}
