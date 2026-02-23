import {
    IsEnum, IsInt, IsBoolean, IsOptional, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TwoFactorScope } from '../entities/security-policy.entity';

export class UpdateTwoFactorPolicyDto {
    @ApiPropertyOptional({
        enum: TwoFactorScope,
        description: 'Mandate for all org members (ADMIN, MODERATOR, CONTENT_ADMIN, SALES, REGIONAL_ADMIN)',
        example: TwoFactorScope.REQUIRED,
    })
    @IsEnum(TwoFactorScope)
    @IsOptional()
    twoFactorPolicyOrgMembers?: TwoFactorScope;

    @ApiPropertyOptional({
        enum: TwoFactorScope,
        description: 'Mandate for volunteers and volunteer managers (AccountFlags)',
        example: TwoFactorScope.OPTIONAL,
    })
    @IsEnum(TwoFactorScope)
    @IsOptional()
    twoFactorPolicyVolunteers?: TwoFactorScope;
}

export class UpdatePasswordPolicyDto {
    @ApiPropertyOptional({ example: 12, minimum: 8, maximum: 128, description: 'Minimum password length' })
    @IsInt() @Min(8) @Max(128) @IsOptional()
    passwordMinLength?: number;

    @ApiPropertyOptional({ example: 64, minimum: 16, maximum: 256, description: 'Maximum password length' })
    @IsInt() @Min(16) @Max(256) @IsOptional()
    passwordMaxLength?: number;

    @ApiPropertyOptional({ example: true, description: 'Require at least one uppercase letter' })
    @IsBoolean() @IsOptional()
    passwordRequireUppercase?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Require at least one lowercase letter' })
    @IsBoolean() @IsOptional()
    passwordRequireLowercase?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Require at least one numeric digit' })
    @IsBoolean() @IsOptional()
    passwordRequireNumbers?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Require at least one special character (!@#$%^&* etc.)' })
    @IsBoolean() @IsOptional()
    passwordRequireSpecialChars?: boolean;
}

export class UpdatePasswordRotationDto {
    @ApiPropertyOptional({ example: true, description: 'Enable password rotation (expiry)' })
    @IsBoolean() @IsOptional()
    passwordRotationEnabled?: boolean;

    @ApiPropertyOptional({
        example: 90,
        minimum: 30,
        maximum: 365,
        description: 'Rotation interval in days. Members will be prompted to change their password after this period.',
    })
    @IsInt() @Min(30) @Max(365) @IsOptional()
    passwordRotationDays?: number;

    @ApiPropertyOptional({
        example: 5,
        minimum: 0,
        maximum: 24,
        description: 'Number of previous passwords that cannot be reused. Set to 0 to disable history check.',
    })
    @IsInt() @Min(0) @Max(24) @IsOptional()
    passwordHistoryCount?: number;
}
