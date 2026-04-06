import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory } from '../entities/support-ticket.entity';
import { FaqCategory } from '../entities/support-faq.entity';

export class CreateTicketDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: TicketCategory })
    @IsEnum(TicketCategory)
    category: TicketCategory;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    attachments?: string[];
}

export class ResolveTicketDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    adminNotes?: string;
}

export class CreateFaqDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
