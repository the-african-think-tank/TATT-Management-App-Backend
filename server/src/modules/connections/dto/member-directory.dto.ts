import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MemberSearchQueryDto {
    @ApiProperty({ required: false, description: 'Search name, profession, or company' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, description: 'Filter by chapter ID' })
    @IsOptional()
    @IsString()
    chapterId?: string;

    @ApiProperty({ required: false, description: 'Filter by industry' })
    @IsOptional()
    @IsString()
    industry?: string;

    @ApiProperty({ required: false, default: 1, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, default: 10, example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}
