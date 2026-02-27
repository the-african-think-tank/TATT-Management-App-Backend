import { IsString, IsNotEmpty, IsArray, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChapterDto {
    @ApiProperty({ description: 'Unique chapter code', example: 'NBO-1' })
    @IsString()
    @IsNotEmpty()
    @Length(4, 4, { message: 'Chapter code must be exactly 4 characters.' })
    code: string;

    @ApiProperty({ description: 'Full name of the chapter', example: 'Nairobi Chapter' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Optional description of the region or focus', example: 'Serving the greater Nairobi metropolitan area.' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ type: [String], description: 'List of cities covered by this chapter', example: ['Nairobi', 'Kiambu', 'Machakos'] })
    @IsArray()
    @IsString({ each: true })
    cities: string[];

    @ApiPropertyOptional({ description: 'UUID of the User assigned as regional manager', example: 'b2c9f1a0-4e8d-4f71-bf14-01e23f4a5678' })
    @IsString()
    @IsOptional()
    regionalManagerId?: string;
}
