import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class ApplyJobDto {
    @ApiProperty({ description: 'Applicant full name', example: 'Kwame Mensah' })
    @IsString() @IsNotEmpty() @MaxLength(255)
    fullName: string;

    @ApiProperty({ description: 'Applicant email', example: 'kwame@thinktank.org' })
    @IsEmail() @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ description: 'Applicant phone number' })
    @IsOptional() @IsString() @MaxLength(64)
    phone?: string;

    @ApiPropertyOptional({ description: 'URL of uploaded resume/CV' })
    @IsOptional() @IsString() @MaxLength(512)
    resumeUrl?: string;

    @ApiPropertyOptional({ description: 'Optional cover letter' })
    @IsOptional() @IsString()
    coverLetter?: string;
}

export class CreateJobDto {
    @ApiProperty() @IsString() @IsNotEmpty() title: string;
    @ApiProperty() @IsString() @IsNotEmpty() companyName: string;
    @ApiProperty() @IsString() @IsNotEmpty() location: string;
    @ApiProperty() @IsString() @IsNotEmpty() type: string;
    @ApiProperty() @IsString() @IsNotEmpty() category: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() requirements?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() qualifications?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() companyLogoUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() companyWebsite?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() salaryLabel?: string;
    @ApiPropertyOptional() @IsOptional() @IsNumber() salaryMin?: number;
    @ApiPropertyOptional() @IsOptional() @IsNumber() salaryMax?: number;
    @ApiPropertyOptional() @IsOptional() @IsString() jobLink?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() postedById?: string;
}

export class FlagJobDto {
    @ApiPropertyOptional({ description: 'Reason for flagging or unlisting' })
    @IsOptional() @IsString()
    reason?: string;
}
