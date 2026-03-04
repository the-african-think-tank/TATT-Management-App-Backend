import {
    Controller, Get, Post, Body, HttpCode, HttpStatus,
    Request, UseGuards, Ip,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiBearerAuth, ApiBody,
    ApiResponse, ApiExtraModels,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
    SignInDto, BootstrapAdminDto, AddOrgMemberDto, CompleteOrgMemberDto,
    CommunitySignupDto, ForgotPasswordDto, ResetPasswordDto,
} from './dto/auth.dto';
import {
    SignInMultiFactorResponseSchema,
    AuthTokenResponseSchema,
    GenericAuthMessageResponseSchema,
} from './dto/auth.schemas';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { SystemRole } from '../enums/roles.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// ─── Inline request DTOs for the 2FA login step ──────────────────────────────
class CompleteTwoFactorDto {
    @ApiProperty({ description: 'The partialToken returned by POST /auth/signin', example: 'eyJhbGci...' })
    @IsString() @IsNotEmpty()
    partialToken: string;

    @ApiProperty({ description: '6-digit OTP from authenticator app or email', example: '482019', minLength: 6, maxLength: 6 })
    @IsString() @IsNotEmpty() @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
    otp: string;
}

class ResendEmailOtpDto {
    @ApiProperty({ description: 'The partialToken returned by POST /auth/signin', example: 'eyJhbGci...' })
    @IsString() @IsNotEmpty()
    partialToken: string;
}

class RotatePasswordDto {
    @ApiProperty({ description: 'The rotationToken returned when a sign-in is blocked by expired password', example: 'eyJhbGci...' })
    @IsString() @IsNotEmpty()
    rotationToken: string;

    @ApiProperty({ description: 'New password (must satisfy the current password policy)', example: 'NewStr0ng!Pass#2026', minLength: 8, maxLength: 128 })
    @IsString() @IsNotEmpty() @MinLength(8) @MaxLength(128)
    newPassword: string;
}

@ApiTags('Authentication')
@ApiExtraModels(SignInMultiFactorResponseSchema, AuthTokenResponseSchema, GenericAuthMessageResponseSchema)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ─── CORE AUTH ─────────────────────────────────────────────────────────────

    @ApiOperation({
        summary: 'Sign in',
        description:
            'Authenticates with email + password. **Three possible outcomes:**\n\n' +
            '1. **Full JWT returned** — no 2FA needed.\n' +
            '2. **`requiresTwoFactor: true`** — 2FA is enabled; use the `partialToken` to call `POST /auth/2fa/complete`.\n' +
            '3. **`requiresTwoFactorSetup: true`** — policy mandates 2FA but it is not set up; use `setupToken` to complete setup first.\n' +
            '4. **`requiresPasswordRotation: true`** — password has expired; use `rotationToken` at `POST /auth/password/rotate`.',
    })
    @ApiBody({ type: SignInDto })
    @ApiResponse({
        status: 200,
        description: 'Sign-in result. Check the response flags to determine the next step.',
        type: SignInMultiFactorResponseSchema,
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account.' })
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() signInDto: SignInDto, @Ip() ip: string) {
        return this.authService.signIn(signInDto, ip);
    }

    @ApiOperation({ summary: 'Get current user profile', description: 'Returns the authenticated user\'s profile including chapter. Requires valid JWT.' })
    @ApiResponse({ status: 200, description: 'Current user profile (id, name, email, systemRole, communityTier, chapterId, chapterName, etc.).' })
    @ApiResponse({ status: 401, description: 'Unauthorized — JWT missing or invalid.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req) {
        return this.authService.getMe(req.user.id);
    }

    @ApiOperation({
        summary: 'Complete 2FA sign-in',
        description:
            'Submit the 6-digit OTP to complete the login flow after `POST /auth/signin` returned `requiresTwoFactor: true`. ' +
            'Returns a full JWT on success.',
    })
    @ApiBody({ type: CompleteTwoFactorDto })
    @ApiResponse({ status: 200, description: 'Full JWT returned — login complete.', type: AuthTokenResponseSchema })
    @ApiResponse({ status: 401, description: 'Invalid or expired OTP / partial token.' })
    @ApiResponse({ status: 403, description: 'OTP locked due to too many failed attempts.' })
    @Post('2fa/complete')
    @HttpCode(HttpStatus.OK)
    async completeTwoFactor(@Body() dto: CompleteTwoFactorDto, @Ip() ip: string) {
        return this.authService.completeTwoFactorSignIn(dto.partialToken, dto.otp, ip);
    }

    @ApiOperation({
        summary: 'Resend Email OTP during 2FA login',
        description: 'Request a new email OTP if the previous one expired. Requires the `partialToken` from sign-in.',
    })
    @ApiBody({ type: ResendEmailOtpDto })
    @ApiResponse({ status: 200, description: 'New OTP dispatched.', type: GenericAuthMessageResponseSchema })
    @ApiResponse({ status: 400, description: 'Only valid for Email OTP method.' })
    @ApiResponse({ status: 401, description: 'Partial token invalid or expired.' })
    @Post('2fa/resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendEmailOtp(@Body() dto: ResendEmailOtpDto, @Ip() ip: string) {
        return this.authService.resendEmailOtp(dto.partialToken, ip);
    }

    @ApiOperation({
        summary: 'Rotate an expired password',
        description:
            'Used when `POST /auth/signin` returns `requiresPasswordRotation: true`. ' +
            'Submit the `rotationToken` and a new password. The new password must satisfy the current complexity policy ' +
            'and must not be one of the previously used passwords (if history is enforced). ' +
            'Returns a full JWT on success.',
    })
    @ApiBody({ type: RotatePasswordDto })
    @ApiResponse({ status: 200, description: 'Password updated, full JWT returned.', type: AuthTokenResponseSchema })
    @ApiResponse({ status: 400, description: 'Password does not meet policy requirements or was recently used.' })
    @ApiResponse({ status: 401, description: 'Rotation token invalid or expired.' })
    @Post('password/rotate')
    @HttpCode(HttpStatus.OK)
    async rotatePassword(@Body() dto: RotatePasswordDto) {
        return this.authService.rotateExpiredPassword(dto.rotationToken, dto.newPassword);
    }

    // ─── PASSWORD RESET (self-service) ────────────────────────────────────────

    @ApiOperation({ summary: 'Request a password reset email' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Email dispatched if address is registered (always 200 to prevent user enumeration).',
        type: GenericAuthMessageResponseSchema,
    })
    @Post('password/forgot')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotDto);
    }

    @ApiOperation({ summary: 'Reset password with token from email link' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset successfully.', type: GenericAuthMessageResponseSchema })
    @ApiResponse({ status: 400, description: 'Password does not meet policy or was recently used.' })
    @ApiResponse({ status: 401, description: 'Token invalid or expired.' })
    @Post('password/reset')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetDto);
    }

    // ─── BOOTSTRAP FIRST ADMIN ───────────────────────────────────────────────

    @ApiOperation({
        summary: 'Create the first admin account (one-time)',
        description:
            '**No JWT required.** Only works when there is no existing user with role ADMIN or SUPERADMIN. ' +
            'Use this once to create your first admin account, then sign in at POST /auth/signin. ' +
            'After that, use POST /auth/org-member/add to add more org members (with JWT).',
    })
    @ApiBody({ type: BootstrapAdminDto })
    @ApiResponse({ status: 201, description: 'First admin created. Sign in with the same email and password.' })
    @ApiResponse({ status: 403, description: 'An admin already exists; bootstrap not allowed.' })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    @Post('bootstrap-admin')
    @HttpCode(HttpStatus.CREATED)
    async bootstrapAdmin(@Body() dto: BootstrapAdminDto) {
        return this.authService.bootstrapFirstAdmin(dto);
    }

    // ─── COMMUNITY SIGNUP ─────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Sign up a new community member' })
    @ApiBody({ type: CommunitySignupDto })
    @ApiResponse({ status: 201, description: 'Account created and JWT returned.', type: AuthTokenResponseSchema })
    @Post('signup/community')
    @HttpCode(HttpStatus.CREATED)
    async communitySignup(@Body() signupDto: CommunitySignupDto) {
        return this.authService.signupCommunityMember(signupDto);
    }

    // ─── ORG MEMBER MANAGEMENT (Admin only) ──────────────────────────────────

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a new organisational member (Admin only)' })
    @ApiBody({ type: AddOrgMemberDto })
    @ApiResponse({ status: 201, description: 'Org member created and invitation email sent.', type: GenericAuthMessageResponseSchema })
    @ApiResponse({ status: 403, description: 'Insufficient role.' })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('org-member/add')
    @HttpCode(HttpStatus.CREATED)
    async addOrgMember(@Body() addMemberDto: AddOrgMemberDto, @Request() req) {
        return this.authService.addOrgMember(addMemberDto, req.user);
    }

    @ApiOperation({ summary: 'Complete organisational member registration via invite link' })
    @ApiBody({ type: CompleteOrgMemberDto })
    @ApiResponse({ status: 200, description: 'Registration complete, JWT returned.', type: AuthTokenResponseSchema })
    @ApiResponse({ status: 401, description: 'Invalid or expired token.' })
    @Post('org-member/complete-registration')
    @HttpCode(HttpStatus.OK)
    async completeOrgRegistration(@Body() completeRegistrationDto: CompleteOrgMemberDto) {
        return this.authService.completeOrgMemberRegistration(completeRegistrationDto);
    }
}
