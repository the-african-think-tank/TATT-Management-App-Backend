import { Controller, Post, Get, Req, Res, Headers, HttpStatus, RawBodyRequest, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';

@ApiTags('Billing & Subscriptions')
@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    // Stripe Webhook Endpoint (Requires raw JSON payload matching signature)
    @ApiOperation({ summary: 'Stripe Webhook Endpoint' })
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

    // --- ADMIN SUBSCRIPTION VIEWS ---

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all non-free subscribers (Admin only)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('subscribers')
    async getSubscribers() {
        return this.billingService.getAllSubscribers();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get upcoming renewals (Admin only)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('renewals')
    async getRenewals() {
        return this.billingService.getUpcomingRenewals();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Notify upcoming renewals (Admin only)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('notify-renewals')
    async notifyRenewals() {
        return this.billingService.notifyUpcomingRenewals();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get revenue metrics (SuperAdmin only)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.SUPERADMIN) // Strictly Superadmin for financial metrics
    @Get('revenue')
    async getRevenue() {
        return this.billingService.getRevenueMetrics();
    }
}
