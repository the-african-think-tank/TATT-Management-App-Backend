import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SystemRole, AccountFlags } from '../../enums/roles.enum';

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
