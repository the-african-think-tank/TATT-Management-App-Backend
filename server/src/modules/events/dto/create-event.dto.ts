import { IsString, IsEnum, IsArray, IsDateString, IsBoolean, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../enums/event-type.enum';
import { CommunityTier } from '../../iam/enums/roles.enum';

export class EventLocationDto {
    @IsUUID()
    chapterId: string;

    @IsString()
    address: string;
}

export class CreateEventDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsDateString()
    dateTime: string;

    @IsEnum(EventType)
    type: EventType;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsBoolean()
    isForAllMembers: boolean;

    @IsArray()
    @IsEnum(CommunityTier, { each: true })
    @IsOptional()
    targetMembershipTiers?: CommunityTier[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EventLocationDto)
    locations: EventLocationDto[];

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    featuredGuestIds?: string[];
}
