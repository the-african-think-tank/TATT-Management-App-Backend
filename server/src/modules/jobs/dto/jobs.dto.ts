import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class ApplyJobDto {
    @ApiProperty({ description: 'Applicant full name', example: 'Kwame Mensah' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    fullName: string;

    @ApiProperty({ description: 'Applicant email', example: 'kwame@thinktank.org' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ description: 'Applicant phone number', example: '+234...' })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    phone?: string;

    @ApiPropertyOptional({ description: 'URL of uploaded resume/CV (from uploads endpoint)' })
    @IsOptional()
    @IsString()
    @MaxLength(512)
    resumeUrl?: string;

    @ApiPropertyOptional({ description: 'Optional cover letter or message to employer' })
    @IsOptional()
    @IsString()
    coverLetter?: string;
}
