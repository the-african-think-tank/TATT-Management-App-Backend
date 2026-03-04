import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SystemRole, AccountFlags, ConnectionPreference } from '../../enums/roles.enum';

export class UpdateUserDto {
    @ApiProperty({ description: 'The new system role for the user', enum: SystemRole, required: false })
    @IsEnum(SystemRole)
    @IsOptional()
    systemRole?: SystemRole;

    @ApiProperty({ description: 'Array of account flags/permissions', enum: [AccountFlags], isArray: true, required: false })
    @IsArray()
    @IsEnum(AccountFlags, { each: true })
    @IsOptional()
    flags?: AccountFlags[];

    @ApiProperty({ description: 'ID of the regional chapter they belong to', required: false })
    @IsString()
    @IsOptional()
    chapterId?: string;

    @ApiProperty({ description: 'Whether the user account is active/suspended', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    professionTitle?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    industry?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    professionalHighlight?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    companyName?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    expertise?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    profilePicture?: string;

    @ApiProperty({ enum: ConnectionPreference, required: false })
    @IsEnum(ConnectionPreference)
    @IsOptional()
    connectionPreference?: ConnectionPreference;

    @ApiProperty({ required: false, type: [String], description: 'Array of interest IDs' })
    @IsArray() @IsString({ each: true })
    @IsOptional()
    interests?: string[];

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    businessName?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    businessRole?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    businessProfileLink?: string;

    @ApiProperty({ required: false })
    @IsString() @IsOptional()
    linkedInProfileUrl?: string;
}
