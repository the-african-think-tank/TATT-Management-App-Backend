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
import { NotificationsService } from '../notifications/services/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

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
        private notificationsService: NotificationsService,
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

    async createPlan(dto: any) {
        return this.planRepo.create(dto);
    }

    // --- Legacy Tiers (Internal logic) ---

    async getTiers() {
        // Redirection to use the rich plans table instead of the simple tier table
        return this.getPlans();
    }

    async updateTier(id: string, dto: any) {
        return this.updatePlan(id, dto);
    }

    async createTier(dto: any) {
        return this.createPlan(dto);
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

            const discount = await this.discountRepo.create({
                ...dto,
                stripeCouponId: stripeCoupon.id
            });

            // Trigger Notifications for members not on these plans
            if (dto.applicablePlans && dto.applicablePlans.length > 0) {
                const targetPlans = dto.applicablePlans.join(', ');
                const usersToNotify = await this.userRepo.findAll({
                    where: {
                        communityTier: { [Op.notIn]: dto.applicablePlans },
                        isActive: true
                    }
                });

                for (const user of usersToNotify) {
                    await this.notificationsService.create(
                        user.id,
                        NotificationType.PROMOTION,
                        `New Exclusive Offer: ${dto.name}`,
                        `Unlock ${dto.value}${dto.discountType === DiscountType.PERCENTAGE ? '%' : '$'} off on ${targetPlans} plans! Limited time offer. Upgrade now to claim.`,
                        { discountCode: dto.code, plans: dto.applicablePlans, url: '/dashboard/upgrade' },
                        true
                    );
                }
            }

            return discount;
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

    async getSubscribedMembers(filters: any) {
        const { chapterId, tier, billingCycle, search, page = 1, limit = 10 } = filters;
        const where: any = {};
        const offset = (page - 1) * limit;

        if (chapterId) {
            where.chapterId = chapterId;
        }

        if (tier) {
            where.communityTier = tier;
        }

        if (billingCycle) {
            where.billingCycle = billingCycle;
        }

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { professionTitle: { [Op.iLike]: `%${search}%` } },
                { companyName: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await this.userRepo.findAndCountAll({
            where,
            include: [{
                model: Chapter,
                as: 'chapter',
                attributes: ['id', 'name', 'code']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            paranoid: false
        });

        return {
            members: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    }

    async getChapters() {
        return this.chapterRepo.findAll({
            attributes: ['id', 'name', 'code']
        });
    }

    async getMembershipAnalytics() {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const growthLabels = [];
        for (let i = 5; i >= 0; i--) {
            growthLabels.push(months[(now.getMonth() - i + 12) % 12]);
        }

        const activeTiers = [CommunityTier.UBUNTU, CommunityTier.IMANI, CommunityTier.KIONGOZI];
        const tierGrowth: any = {};

        // Calculate Tier Growth for the last 6 months
        for (const tier of activeTiers) {
            const monthlyCounts = await this.userRepo.findAll({
                attributes: [
                    [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'month'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                where: {
                    communityTier: tier,
                    createdAt: { [Op.gte]: sixMonthsAgo }
                },
                group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))],
                order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'ASC']],
                raw: true
            });

            // Fill in the 6-month array
            const data = new Array(6).fill(0);
            monthlyCounts.forEach((m: any) => {
                const date = new Date(m.month);
                const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
                const index = 5 - monthDiff;
                if (index >= 0 && index < 6) {
                    data[index] = parseInt(m.count, 10);
                }
            });
            tierGrowth[tier] = data;
        }

        // Calculate Total Growth Rate (Current Month vs Last Month)
        const currentMonthCount = await this.userRepo.count({
            where: { createdAt: { [Op.gte]: currentMonthStart } }
        });
        const lastMonthCount = await this.userRepo.count({
            where: {
                createdAt: {
                    [Op.gte]: lastMonthStart,
                    [Op.lt]: currentMonthStart
                }
            }
        });

        let totalGrowthRate = "0%";
        if (lastMonthCount === 0) {
            totalGrowthRate = currentMonthCount > 0 ? `+${currentMonthCount * 100}%` : "0%";
        } else {
            const rate = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
            totalGrowthRate = `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
        }

        return {
            labels: growthLabels,
            tierGrowth,
            totalGrowthRate
        };
    }
}
