import { Controller, Post, Get, Req, Res, Headers, HttpStatus, RawBodyRequest, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { SubscriberSchema, RevenueMetricsSchema, GenericMessageResponseSchema } from './dto/billing.schemas';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Billing & Subscriptions')
@ApiExtraModels(SubscriberSchema, RevenueMetricsSchema, GenericMessageResponseSchema)
@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    // Stripe Webhook Endpoint (Requires raw JSON payload matching signature)
    @ApiOperation({
        summary: 'Stripe Webhook Endpoint',
        description: 'Receives events from Stripe (subscription updates, payment success, etc.). **Requires raw JSON payload and signature verification.**'
    })
    @ApiResponse({ status: 200, description: 'Event received.' })
    @ApiResponse({ status: 400, description: 'Invalid signature or payload.' })
    @Post('webhook/stripe')
    async handleStripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
        @Res() res: Response
    ) {
        if (!signature || !req.rawBody) {
            return res.status(HttpStatus.BAD_REQUEST).send('Missing payload or signature');
        }

        try {
            await this.billingService.handleStripeWebhook(req.rawBody, signature);
            return res.status(HttpStatus.OK).send({ received: true });
        } catch (err: any) {
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
        }
    }

    @ApiOperation({ summary: 'Get all active membership plans (Onboarding)' })
    @Get('plans')
    async getPlans() {
        return this.billingService.getPlans();
    }

    // --- ADMIN SUBSCRIPTION VIEWS ---

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all non-free subscribers (Admin only)',
        description: 'Returns a list of all members currently on a paid tier (Ubuntu, Imani, Kiongozi).'
    })
    @ApiResponse({ status: 200, description: 'List of subscribers.', type: [SubscriberSchema] })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('subscribers')
    async getSubscribers() {
        return this.billingService.getAllSubscribers();
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get upcoming renewals (Admin only)',
        description: 'Returns members on monthly plans without auto-pay whose subscription expires within the next 7 days.'
    })
    @ApiResponse({ status: 200, description: 'List of members needing renewal notification.', type: [SubscriberSchema] })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('renewals')
    async getRenewals() {
        return this.billingService.getUpcomingRenewals();
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Notify upcoming renewals (Admin only)',
        description: 'Sends renewal reminder emails to all members returned by the `/renewals` endpoint.'
    })
    @ApiResponse({ status: 200, description: 'Internal notification run summary.', type: GenericMessageResponseSchema })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('notify-renewals')
    @HttpCode(HttpStatus.OK)
    async notifyRenewals() {
        return this.billingService.notifyUpcomingRenewals();
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get revenue metrics (SuperAdmin only)',
        description: 'Calculates MRR (Monthly Recurring Revenue) and ARR (Annual Run Rate) based on active Stripe subscriptions.'
    })
    @ApiResponse({ status: 200, description: 'Financial metrics.', type: RevenueMetricsSchema })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.SUPERADMIN) // Strictly Superadmin for financial metrics
    @Get('revenue')
    async getRevenue() {
        return this.billingService.getRevenueMetrics();
    }
}
