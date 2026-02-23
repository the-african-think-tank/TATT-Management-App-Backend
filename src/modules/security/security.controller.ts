import {
    Controller, Get, Patch, Post, Delete,
    Body, UseGuards, Request, Ip, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiBearerAuth,
    ApiResponse, ApiBody,
} from '@nestjs/swagger';
import { SecurityPolicyService } from './security-policy.service';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';
import {
    UpdateTwoFactorPolicyDto,
    UpdatePasswordPolicyDto,
    UpdatePasswordRotationDto,
} from './dto/security-policy.dto';

// ─── SMALL INLINE DTOs for the 2FA consumer endpoints ───────────────────────
import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ConfirmOtpDto {
    @ApiProperty({ description: '6-digit OTP code', example: '482019', minLength: 6, maxLength: 6 })
    @IsString() @IsNotEmpty() @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
    otp: string;
}

@ApiTags('Security & Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityController {
    constructor(
        private readonly policyService: SecurityPolicyService,
        private readonly twoFactorService: TwoFactorService,
    ) { }

    // ═══════════════════════════════════════════════════════════════════════════
    //  POLICY — Admin/SuperAdmin only
    // ═══════════════════════════════════════════════════════════════════════════

    @ApiOperation({ summary: 'Get the current global security policy (Admin+)' })
    @ApiResponse({ status: 200, description: 'Current policy object.' })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('policy')
    async getPolicy() {
        return this.policyService.getPolicy();
    }

    @ApiOperation({
        summary: 'Update 2FA policy (Admin+)',
        description:
            'Set the 2FA mandate for **org members** and/or **volunteers** independently. ' +
            'DISABLED = no enforcement; OPTIONAL = encouraged; REQUIRED = must set up before login completes.',
    })
    @ApiBody({ type: UpdateTwoFactorPolicyDto })
    @ApiResponse({ status: 200, description: 'Updated policy.' })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('policy/two-factor')
    async updateTwoFactorPolicy(@Body() dto: UpdateTwoFactorPolicyDto) {
        return this.policyService.updateTwoFactorPolicy(dto);
    }

    @ApiOperation({
        summary: 'Update password complexity policy (Admin+)',
        description:
            'Configure minimum/maximum length and character-class requirements. ' +
            'These rules apply to all password changes across the platform.',
    })
    @ApiBody({ type: UpdatePasswordPolicyDto })
    @ApiResponse({ status: 200, description: 'Updated policy.' })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('policy/password-complexity')
    async updatePasswordPolicy(@Body() dto: UpdatePasswordPolicyDto) {
        return this.policyService.updatePasswordPolicy(dto);
    }

    @ApiOperation({
        summary: 'Update password rotation policy (Admin+)',
        description:
            'Enable/disable password rotation, set the rotation interval (days), ' +
            'and how many previous passwords are blocked from reuse. ' +
            'Warning emails are automatically sent at 30 days, 14 days, and 7 days before expiry.',
    })
    @ApiBody({ type: UpdatePasswordRotationDto })
    @ApiResponse({ status: 200, description: 'Updated policy.' })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('policy/password-rotation')
    async updatePasswordRotationPolicy(@Body() dto: UpdatePasswordRotationDto) {
        return this.policyService.updatePasswordRotationPolicy(dto);
    }

    @ApiOperation({
        summary: 'Manually trigger password expiry notification run (SuperAdmin only)',
        description: 'Normally run by a daily cron job. Forces a check and sends emails to all affected org members.',
    })
    @ApiResponse({ status: 200, description: 'Notification run completed.' })
    @UseGuards(RolesGuard)
    @Roles(SystemRole.SUPERADMIN)
    @Post('policy/password-rotation/notify')
    @HttpCode(HttpStatus.OK)
    async triggerPasswordExpiryNotifications() {
        await this.policyService.sendPasswordExpiryNotifications();
        return { message: 'Password expiry notification run completed.' };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  USER SELF-SERVICE 2FA — any authenticated user
    // ═══════════════════════════════════════════════════════════════════════════

    @ApiOperation({
        summary: 'Start TOTP (authenticator app) 2FA setup',
        description:
            'Generates a new TOTP secret and returns the `otpauthUrl`, a base64 QR code PNG, ' +
            'and the manual entry key. The user scans the QR in their authenticator app ' +
            'and then calls `POST /security/2fa/totp/confirm` with their first code to activate it.',
    })
    @ApiResponse({
        status: 200,
        description: 'TOTP setup credentials — show the QR code to the user.',
        schema: {
            properties: {
                otpauthUrl: { type: 'string' },
                qrCode: { type: 'string', description: 'Base64-encoded QR code PNG (data URL)' },
                manualKey: { type: 'string', description: 'Manual setup key for users who cannot scan QR' },
            },
        },
    })
    @Post('2fa/totp/setup')
    @HttpCode(HttpStatus.OK)
    async setupTotp(@Request() req) {
        return this.twoFactorService.initiateTotpSetup(req.user.id);
    }

    @ApiOperation({
        summary: 'Confirm TOTP setup with first authenticator code',
        description:
            'Provide the 6-digit code from your authenticator app to verify the secret was saved correctly. ' +
            'On success, TOTP 2FA is activated on your account.',
    })
    @ApiBody({ type: ConfirmOtpDto })
    @ApiResponse({ status: 200, description: 'TOTP 2FA activated successfully.' })
    @ApiResponse({ status: 400, description: 'No pending TOTP setup found.' })
    @ApiResponse({ status: 401, description: 'Invalid OTP.' })
    @Post('2fa/totp/confirm')
    @HttpCode(HttpStatus.OK)
    async confirmTotp(@Request() req, @Body() { otp }: ConfirmOtpDto) {
        await this.twoFactorService.confirmTotpSetup(req.user.id, otp);
        return { message: 'TOTP two-factor authentication has been activated on your account.' };
    }

    @ApiOperation({
        summary: 'Start Email OTP 2FA setup',
        description:
            'Sends a 6-digit OTP to your registered email address. ' +
            'Call `POST /security/2fa/email/confirm` with the code to activate Email 2FA.',
    })
    @ApiResponse({ status: 200, description: 'OTP dispatched to your email.' })
    @Post('2fa/email/setup')
    @HttpCode(HttpStatus.OK)
    async setupEmailTwoFactor(@Request() req, @Ip() ip: string) {
        await this.twoFactorService.initiateEmailTwoFactorSetup(req.user.id, ip);
        return { message: 'A verification code has been sent to your registered email address.' };
    }

    @ApiOperation({
        summary: 'Confirm Email 2FA setup with the OTP received',
        description:
            'Verify the OTP that was sent to your email to complete Email 2FA setup.',
    })
    @ApiBody({ type: ConfirmOtpDto })
    @ApiResponse({ status: 200, description: 'Email 2FA activated successfully.' })
    @ApiResponse({ status: 401, description: 'Invalid or expired OTP.' })
    @ApiResponse({ status: 403, description: 'OTP locked due to too many failed attempts.' })
    @Post('2fa/email/confirm')
    @HttpCode(HttpStatus.OK)
    async confirmEmailTwoFactor(@Request() req, @Ip() ip: string, @Body() { otp }: ConfirmOtpDto) {
        await this.twoFactorService.confirmEmailTwoFactorSetup(req.user.id, otp, ip);
        return { message: 'Email two-factor authentication has been activated on your account.' };
    }

    @ApiOperation({
        summary: 'Disable 2FA on your account',
        description:
            'Disables whichever 2FA method is currently active. ' +
            '**Note:** if the security policy mandates 2FA for your role, ' +
            'you will be forced to set it up again on your next login.',
    })
    @ApiResponse({ status: 200, description: '2FA disabled.' })
    @Delete('2fa/disable')
    @HttpCode(HttpStatus.OK)
    async disableTwoFactor(@Request() req) {
        await this.twoFactorService.disableTwoFactor(req.user.id);
        return { message: 'Two-factor authentication has been disabled on your account.' };
    }
}
