import {
    IsString, IsEmail, IsArray, IsNumber,
    IsOptional, IsEnum, MinLength, MaxLength, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePartnershipDto {
    @ApiProperty({
        description: 'Full legal or trading name of the partner organisation.',
        example: 'Global Sky Airways',
        minLength: 3,
    })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({
        description: 'Primary contact email address for the partnership.',
        example: 'partnerships@globalsky.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Industry or sector category the partner belongs to.',
        example: 'Travel & Logistics',
    })
    @IsString()
    category: string;

    @ApiProperty({
        description:
            'Array of membership tier names that can access this partnership benefit. ' +
            'Use TATT tier identifiers: FREE, UBUNTU, IMANI, KIONGOZI.',
        example: ['UBUNTU', 'IMANI', 'KIONGOZI'],
        isArray: true,
        type: String,
    })
    @IsArray()
    @IsString({ each: true })
    tierAccess: string[];

    @ApiPropertyOptional({
        description:
            'Global redemption quota cap across all tiers. Set to null or omit for unlimited global access. ' +
            'Use `tierQuotas` for per-tier caps instead.',
        example: 25,
        nullable: true,
    })
    @IsOptional()
    @IsNumber()
    quotaAmount?: number | null;

    @ApiPropertyOptional({
        description: 'Activation status of the partnership. Defaults to ACTIVE on creation.',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
    })
    @IsOptional()
    @IsEnum(['ACTIVE', 'INACTIVE'])
    status?: 'ACTIVE' | 'INACTIVE';

    @ApiProperty({
        description: 'Publicly accessible URL to the partner\'s logo image.',
        example: 'https://cdn.example.com/logos/globalsky.png',
    })
    @IsString()
    logoUrl: string;

    @ApiProperty({
        description: 'Member-facing description of the partnership benefit.',
        example: 'Enjoy full global travel benefits and priority lounge access as a Kiongozi member.',
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Partner\'s public website URL.',
        example: 'https://www.globalsky.com',
    })
    @IsString()
    website: string;

    @ApiProperty({
        description: 'Label displayed on the CTA button in the Benefits Hub.',
        example: 'Get Access',
    })
    @IsString()
    buttonLabel: string;

    @ApiProperty({
        description:
            'URL members are directed to when claiming or redeeming this benefit. ' +
            'May include SSO or pre-filled partner referral parameters.',
        example: 'https://benefithub.tatt.org/redeem/globalsky',
    })
    @IsString()
    redemptionLink: string;

    @ApiProperty({
        description: 'Full name of the primary contact person at the partner organisation.',
        example: 'John Mensah',
    })
    @IsString()
    contactName: string;

    @ApiProperty({
        description: 'Job title / position of the primary contact person.',
        example: 'Partnerships Manager',
    })
    @IsString()
    contactPosition: string;

    @ApiProperty({
        description:
            'Determines how often per-tier quotas reset. ' +
            'MONTHLY resets on the 1st of each month; ANNUAL resets on Jan 1st.',
        enum: ['MONTHLY', 'ANNUAL'],
        example: 'MONTHLY',
    })
    @IsEnum(['MONTHLY', 'ANNUAL'])
    quotaReset: 'MONTHLY' | 'ANNUAL';

    @ApiProperty({
        description:
            'Per-tier quota map. Keys are tier identifiers (FREE, UBUNTU, IMANI, KIONGOZI). ' +
            'A null value means unlimited access for that tier. ' +
            'A numeric value caps the number of redemptions allowed per reset period.',
        example: { FREE: 0, UBUNTU: 10, IMANI: 50, KIONGOZI: null },
        type: 'object',
        additionalProperties: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
    })
    @IsObject()
    tierQuotas: Record<string, number | null>;

    @ApiPropertyOptional({
        description: 'Original retail price before TATT discount.',
        example: 250.00,
    })
    @IsOptional()
    @IsNumber()
    fullPrice?: number;

    @ApiPropertyOptional({
        description: 'Exclusive discounted price for TATT members.',
        example: 199.00,
    })
    @IsOptional()
    @IsNumber()
    discountedPrice?: number;
}

export class UpdatePartnershipDto extends PartialType(CreatePartnershipDto) {
    @ApiPropertyOptional({
        description:
            'Manually override the quota used counter. Useful when syncing redemption data ' +
            'from an external partner platform.',
        example: 18,
    })
    @IsOptional()
    @IsNumber()
    quotaUsed?: number;
}
