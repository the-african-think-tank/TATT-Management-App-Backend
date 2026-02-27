import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthTokenResponseSchema {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1Ni...' })
    accessToken: string;

    @ApiProperty({ example: '2026-02-23T08:00:00.000Z' })
    expiresAt: string;
}

export class SignInMultiFactorResponseSchema {
    @ApiPropertyOptional({ example: true })
    requiresTwoFactor?: boolean;

    @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1Ni...', description: 'Partial token to be used with /auth/2fa/complete' })
    partialToken?: string;

    @ApiPropertyOptional({ example: 'EMAIL', enum: ['EMAIL', 'TOTP'] })
    twoFactorMethod?: string;

    @ApiPropertyOptional({ example: true })
    requiresTwoFactorSetup?: boolean;

    @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1Ni...', description: 'Setup token to be used with /security/2fa/...' })
    setupToken?: string;

    @ApiPropertyOptional({ example: true })
    requiresPasswordRotation?: boolean;

    @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1Ni...', description: 'Rotation token to be used with /auth/password/rotate' })
    rotationToken?: string;

    @ApiPropertyOptional({ type: AuthTokenResponseSchema })
    auth?: AuthTokenResponseSchema;
}

export class GenericAuthMessageResponseSchema {
    @ApiProperty({ example: 'Action successful' })
    message: string;
}
