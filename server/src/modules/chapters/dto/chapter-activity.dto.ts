import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../entities/chapter-activity.entity';

export class CreateChapterActivityDto {
    @ApiProperty({ enum: ActivityType, example: ActivityType.ANNOUNCEMENT })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiProperty({ example: 'Chapter AGM — Q1 2026' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Our annual general meeting will be held on March 15th...' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/img.jpg' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({ example: '2026-03-15T10:00:00Z' })
    @IsOptional()
    @IsDateString()
    eventDate?: string;

    @ApiPropertyOptional({ example: 'Accra Hub — 5 Liberation Rd' })
    @IsOptional()
    @IsString()
    eventLocation?: string;
}

export class UpdateChapterActivityDto {
    @ApiPropertyOptional({ example: 'Updated title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: 'Updated content' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    eventDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    eventLocation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    isPublished?: boolean;
}
