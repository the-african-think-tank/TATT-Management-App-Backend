import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUrl, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateBusinessApplicationDto {
    @ApiProperty({ example: 'Onyx Collective' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Architecture & Design' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 2024 })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    foundingYear?: number;

    @ApiProperty({ example: 'https://onyx.com' })
    @Transform(({ value }) => value === '' ? null : value)
    @IsUrl()
    @IsOptional()
    website?: string;

    @ApiProperty({ example: 'Nairobi, Kenya' })
    @IsString()
    @IsNotEmpty()
    locationText: string;

    @ApiProperty({ example: 'UUID of chapter' })
    @Transform(({ value }) => value === '' ? null : value)
    @IsUUID()
    @IsOptional()
    chapterId?: string;

    @ApiProperty({ example: 'We align by...' })
    @IsString()
    @IsNotEmpty()
    missionAlignment: string;

    @ApiProperty({ example: '15% discount for members' })
    @IsString()
    @IsNotEmpty()
    perkOffer: string;

    @ApiProperty({ example: 'https://link-to-logo.png' })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ example: 'Premium Partner' })
    @IsString()
    @IsOptional()
    tierRequested?: string;

    @ApiProperty({ example: 'contact@business.com' })
    @IsEmail()
    @IsNotEmpty()
    contactEmail: string;

    @ApiProperty({ example: '+254123456789' })
    @IsString()
    @IsOptional()
    contactPhone?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    contactName?: string;
}

export class UpdateBusinessStatusDto {
    @ApiProperty({ enum: ['APPROVED', 'DECLINED', 'INACTIVE'] })
    @IsString()
    @IsNotEmpty()
    status: 'APPROVED' | 'DECLINED' | 'INACTIVE';

    @ApiProperty({ example: 'Missing documents' })
    @IsString()
    @IsOptional()
    adminNotes?: string;
}
