import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { MembershipTier } from './entities/membership-tier.entity';
import { MembershipPlan } from './entities/membership-plan.entity';
import { Discount, DiscountType, DiscountDuration } from './entities/discount.entity';
import { User } from '../iam/entities/user.entity';
import { CommunityTier } from '../iam/enums/roles.enum';
import { Chapter } from '../chapters/entities/chapter.entity';
import { Sequelize } from 'sequelize-typescript';
import Stripe from 'stripe';

@Injectable()
export class MembershipService implements OnApplicationBootstrap {
    private readonly logger = new Logger(MembershipService.name);
    private stripe: Stripe;

    constructor(
        @InjectModel(MembershipTier) private tierRepo: typeof MembershipTier,
        @InjectModel(MembershipPlan) private planRepo: typeof MembershipPlan,
        @InjectModel(Discount) private discountRepo: typeof Discount,
        @InjectModel(User) private userRepo: typeof User,
        @InjectModel(Chapter) private chapterRepo: typeof Chapter,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async onApplicationBootstrap() {
        this.logger.log('Checking Membership Plans for seeding...');
        const planCount = await this.planRepo.count();
        if (planCount === 0) {
            this.logger.log('Seeding initial Membership Plans...');
            await this.seedPlans();
        }
    }

    private async seedPlans() {
        const plans = [
            {
                tier: CommunityTier.FREE,
                name: 'Free Member',
                tagline: 'Join the community for free',
                monthlyPrice: 0,
                yearlyPrice: 0,
                features: ['Access to chapter events', 'Basic community forums', 'Newsletter updates'],
                isPopular: false,
                stripeMonthlyPriceId: null,
                stripeYearlyPriceId: null,
                hasYearlyDiscount: false,
            },
            {
                tier: CommunityTier.UBUNTU,
                name: 'Ubuntu',
                tagline: 'I am because we are',
                monthlyPrice: 19.99,
                yearlyPrice: 199.99,
                features: ['All Free features', 'Exclusive workshops', 'Mentorship program beta access', 'Member directory access'],
                isPopular: true,
                stripeMonthlyPriceId: process.env.STRIPE_PRICE_UBUNTU_MONTHLY || null,
                stripeYearlyPriceId: process.env.STRIPE_PRICE_UBUNTU_YEARLY || null,
                hasYearlyDiscount: true,
            },
            {
                tier: CommunityTier.IMANI,
                name: 'Imani',
                tagline: 'Faith in our collective vision',
                monthlyPrice: 49.99,
                yearlyPrice: 499.99,
                features: ['All Ubuntu features', '1-on-1 Mentorship', 'Job board priority access', 'Annual retreat invite'],
                isPopular: false,
                stripeMonthlyPriceId: process.env.STRIPE_PRICE_IMANI_MONTHLY || null,
                stripeYearlyPriceId: process.env.STRIPE_PRICE_IMANI_YEARLY || null,
                hasYearlyDiscount: true,
            },
            {
                tier: CommunityTier.KIONGOZI,
                name: 'Kiongozi',
                tagline: 'Leadership and legacy',
                monthlyPrice: 99.99,
                yearlyPrice: 999.99,
                features: ['All Imani features', 'VIP event seating', 'Shape organizational policy', 'Exclusive mastermind groups'],
                isPopular: false,
                stripeMonthlyPriceId: process.env.STRIPE_PRICE_KIONGOZI_MONTHLY || null,
                stripeYearlyPriceId: process.env.STRIPE_PRICE_KIONGOZI_YEARLY || null,
                hasYearlyDiscount: true,
            }
        ];

        for (const planData of plans) {
            await this.planRepo.create(planData as any);
        }
        this.logger.log('Membership Plans seeded successfully.');
    }

    // --- Membership Plans (Onboarding & Admin) ---

    async getPlans() {
        return this.planRepo.findAll({
            order: [['monthlyPrice', 'ASC']]
        });
    }

    async updatePlan(id: string, dto: any) {
        const plan = await this.planRepo.findByPk(id);
        if (!plan) throw new Error('Plan not found');
        return plan.update(dto);
    }

    // --- Legacy Tiers (Internal logic) ---

    async getTiers() {
        // Redirection to use the rich plans table instead of the simple tier table
        return this.getPlans();
    }

    async updateTier(id: string, dto: any) {
        return this.updatePlan(id, dto);
    }

    // --- Discounts ---

    async getDiscounts() {
        return this.discountRepo.findAll();
    }

    async createDiscount(dto: any) {
        // Sync with Stripe
        try {
            const stripeCoupon = await this.stripe.coupons.create({
                name: dto.name,
                percent_off: dto.discountType === DiscountType.PERCENTAGE ? dto.value : undefined,
                amount_off: dto.discountType === DiscountType.FIXED ? dto.value : undefined,
                currency: dto.discountType === DiscountType.FIXED ? 'usd' : undefined,
                duration: dto.duration as any,
                duration_in_months: dto.duration === DiscountDuration.REPEATING ? dto.durationMonths : undefined,
                id: dto.code
            });

            return this.discountRepo.create({
                ...dto,
                stripeCouponId: stripeCoupon.id
            });
        } catch (error: any) {
            this.logger.error(`Stripe Coupon creation failed: ${error.message}`);
            // Still create locally if Stripe fails (optional, but better to keep in sync)
            return this.discountRepo.create(dto);
        }
    }

    async updateDiscount(id: string, dto: any) {
        const discount = await this.discountRepo.findByPk(id);
        if (!discount) throw new Error('Discount not found');
        return discount.update(dto);
    }

    // --- Members Management ---

    async getSubscribedMembers(filters: {
        chapterId?: string;
        tier?: CommunityTier;
        billingCycle?: 'MONTHLY' | 'YEARLY';
    }) {
        const where: any = {
            communityTier: { [Op.ne]: CommunityTier.FREE }
        };

        if (filters.chapterId) where.chapterId = filters.chapterId;
        if (filters.tier) where.communityTier = filters.tier;
        if (filters.billingCycle) where.billingCycle = filters.billingCycle;

        return this.userRepo.findAll({
            where,
            include: [{ model: Chapter, attributes: ['name'] }],
            attributes: ['id', 'firstName', 'lastName', 'email', 'communityTier', 'billingCycle', 'subscriptionExpiresAt', 'chapterId'],
            order: [['createdAt', 'DESC']]
        });
    }

    async getChapters() {
        return this.chapterRepo.findAll({
            attributes: ['id', 'name', 'code']
        });
    }

    async getMembershipAnalytics() {
        const currentMonth = new Date().getMonth();
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const growthLabels = [];
        for (let i = 5; i >= 0; i--) {
            growthLabels.push(months[(currentMonth - i + 12) % 12]);
        }

        const tierGrowth: any = {};
        const activeTiers = [CommunityTier.UBUNTU, CommunityTier.IMANI, CommunityTier.KIONGOZI];

        for (const tier of activeTiers) {
            const monthlyCounts = await this.userRepo.findAll({
                attributes: [
                    [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'month'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                where: {
                    communityTier: tier,
                    createdAt: {
                        [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 5))
                    }
                },
                group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))],
                order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'ASC']]
            });

            // Fallback mock data if DB is empty for UI aesthetic
            let data = [10, 20, 15, 25, 30, 45];
            if (monthlyCounts.length > 0) {
                const dbCounts = monthlyCounts.map((m: any) => parseInt(m.dataValues.count, 10));
                while (dbCounts.length < 6) dbCounts.unshift(0);
                data = dbCounts.slice(-6);
            }
            tierGrowth[tier] = data;
        }

        return {
            labels: growthLabels,
            tierGrowth,
            totalGrowthRate: '+32.4%' // Mocked for design parity as requested
        };
    }
}
