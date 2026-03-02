import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEnum, ValidateIf, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SystemRole, CommunityTier, AccountFlags } from '../../enums/roles.enum';

export class SignInDto {
    @IsEmail({}, { message: 'Must be a valid email format' })
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

/** Only allowed when no ADMIN/SUPERADMIN exists. Creates the first admin account. */
export class BootstrapAdminDto {
    @ApiProperty({ example: 'Admin' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'User' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'admin@example.com' })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @ApiProperty({ example: 'SecurePass123!', minLength: 8, maxLength: 128 })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(128)
    password: string;
}

export class AddOrgMemberDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsNotEmpty()
    professionTitle: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsEnum(SystemRole)
    systemRole: SystemRole;
}

export class CompleteOrgMemberDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(64)
    password: string;
}

export class CommunitySignupDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(64)
    password: string;

    @IsString()
    @IsOptional()
    professionTitle?: string;

    @IsString()
    @IsOptional()
    industry?: string;

    @IsString()
    @IsOptional()
    chapterId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    interestIds?: string[];

    @IsEnum(CommunityTier)
    communityTier: CommunityTier;

    @ValidateIf(o => o.communityTier !== CommunityTier.FREE)
    @IsString()
    @IsNotEmpty({ message: 'Payment method token is required for paid tiers' })
    paymentMethodId?: string;

    @ValidateIf(o => o.communityTier !== CommunityTier.FREE)
    @IsString()
    @IsEnum(['MONTHLY', 'YEARLY'])
    billingCycle?: 'MONTHLY' | 'YEARLY';
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Must be a valid email format' })
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(64)
    newPassword: string;
}
