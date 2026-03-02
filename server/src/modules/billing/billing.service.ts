import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import Stripe from 'stripe';
import { User } from '../iam/entities/user.entity';
import { CommunityTier } from '../iam/enums/roles.enum';
import { MailService } from '../../common/mail/mail.service';
import { EventRegistration } from '../events/entities/event-registration.entity';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private stripe: Stripe;

    constructor(
        @InjectModel(User) private userRepository: typeof User,
        @InjectModel(EventRegistration) private eventRegistrationRepo: typeof EventRegistration,
        private mailService: MailService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async handleStripeWebhook(payload: Buffer, signature: string) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new Error('Webhook Signature Failed');
        }

        switch (event.type) {
            case 'customer.subscription.deleted':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
                    await this.handleSubscriptionExpiredOrFailed(subscription);
                } else {
                    await this.handleSubscriptionAutoPayStatus(subscription);
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await this.handleSubscriptionRenewalSuccess(invoice);
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.metadata?.type === 'EVENT_REGISTRATION') {
                    await this.handleEventRegistrationPayment(session);
                }
                break;
            }
            default:
                this.logger.log(`Unhandled Stripe event type: ${event.type}`);
        }
    }

    private async handleEventRegistrationPayment(session: Stripe.Checkout.Session) {
        const registrationId = session.metadata?.registrationId;
        if (!registrationId) return;

        const registration = await this.eventRegistrationRepo.findByPk(registrationId);
        if (!registration) {
            this.logger.error(`Event registration not found for ID: ${registrationId}`);
            return;
        }

        registration.status = 'COMPLETED';
        registration.stripePaymentIntentId = session.payment_intent as string;
        await registration.save();

        this.logger.log(`Event registration ${registrationId} payment confirmed and status updated to COMPLETED.`);
    }

    private async handleSubscriptionExpiredOrFailed(subscription: Stripe.Subscription) {
        const customerId = subscription.customer as string;

        const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
            this.logger.warn(`Webhook received for unknown Stripe Customer ID: ${customerId}`);
            return;
        }

        if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
            user.communityTier = CommunityTier.FREE;
            user.subscriptionExpiresAt = null;
            await user.save();

            this.logger.log(`User ${user.email} downgraded to FREE tier`);
            // Send downgrade notification email
            await this.mailService.sendSubscriptionDowngradeNotice(user.email, user.firstName, subscription.status);
        }
    }

    private async handleSubscriptionRenewalSuccess(invoice: Stripe.Invoice) {
        const invoiceSub = (invoice as any).subscription as string;
        if (!invoiceSub) return;

        const customerId = invoice.customer as string;
        const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });

        if (!user) {
            this.logger.warn(`Webhook received renewal for unknown Stripe Customer ID: ${customerId}`);
            return;
        }

        const subscriptionResp = await this.stripe.subscriptions.retrieve(invoiceSub);
        const currentPeriodEnd = (subscriptionResp as any).current_period_end;

        const expiresAt = new Date(currentPeriodEnd * 1000);
        user.subscriptionExpiresAt = expiresAt;
        await user.save();

        this.logger.log(`User ${user.email} subscription automatically renewed until ${expiresAt.toISOString()}`);
    }

    private async handleSubscriptionAutoPayStatus(subscription: Stripe.Subscription) {
        const customerId = subscription.customer as string;
        const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) return;

        const isAutoPayEnabled = !subscription.cancel_at_period_end;
        if (user.hasAutoPayEnabled !== isAutoPayEnabled) {
            user.hasAutoPayEnabled = isAutoPayEnabled;
            await user.save();
            this.logger.log(`User ${user.email} auto-pay status updated to: ${isAutoPayEnabled}`);
        }
    }

    // --- ADMIN SUBSCRIPTION VIEWS ---

    async getAllSubscribers() {
        return this.userRepository.findAll({
            where: {
                communityTier: { [Op.ne]: CommunityTier.FREE },
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'communityTier', 'subscriptionExpiresAt', 'billingCycle', 'hasAutoPayEnabled', 'systemRole']
        });
    }

    async getUpcomingRenewals() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        return this.userRepository.findAll({
            where: {
                communityTier: { [Op.ne]: CommunityTier.FREE },
                billingCycle: 'MONTHLY',
                hasAutoPayEnabled: false,
                subscriptionExpiresAt: {
                    [Op.and]: {
                        [Op.gte]: new Date(),
                        [Op.lte]: nextWeek
                    }
                }
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'communityTier', 'subscriptionExpiresAt']
        });
    }

    async notifyUpcomingRenewals() {
        const usersToNotify = await this.getUpcomingRenewals();

        let sentCount = 0;
        for (const user of usersToNotify) {
            await this.mailService.sendRenewalReminder(user.email, user.firstName, user.subscriptionExpiresAt);
            sentCount++;
        }

        return { message: `Notified ${sentCount} community members about upcoming renewals.` };
    }

    async getRevenueMetrics() {
        let activeSubscriptions = 0;
        let estimatedMonthlyRevenue = 0;

        try {
            const subscriptions = await this.stripe.subscriptions.list({ status: 'active', limit: 100 });
            activeSubscriptions = subscriptions.data.length;

            for (const sub of subscriptions.data) {
                const price = (sub.items.data[0].price.unit_amount || 0) / 100;
                const interval = sub.items.data[0].price.recurring?.interval;

                if (interval === 'month') {
                    estimatedMonthlyRevenue += price;
                } else if (interval === 'year') {
                    estimatedMonthlyRevenue += (price / 12);
                }
            }

            return {
                activeSubscriptions,
                estimatedMonthlyRevenue,
                estimatedAnnualRunRate: estimatedMonthlyRevenue * 12,
                currency: 'USD'
            };
        } catch (error: any) {
            this.logger.error('Failed to fetch revenue metrics from Stripe', error.message);
            throw new Error('Failed to fetch financial metrics');
        }
    }
}
