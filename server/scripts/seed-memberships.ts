import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MembershipTier } from '../src/modules/membership/entities/membership-tier.entity';
import { Discount, DiscountType, DiscountDuration } from '../src/modules/membership/entities/discount.entity';
import { CommunityTier } from '../src/modules/iam/enums/roles.enum';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    // Seed Membership Tiers
    const tiers = [
        {
            tier: CommunityTier.FREE,
            name: 'Free Member',
            description: 'Basic access to the TATT community platform.',
            perks: ['View public posts', 'Basic profile search', 'Participate in chapter events'],
            monthlyPrice: 0,
            yearlyPrice: 0,
        },
        {
            tier: CommunityTier.UBUNTU,
            name: 'Ubuntu Membership',
            description: 'Full networking and community access.',
            perks: ['Unlimited connection requests', 'Access to Ubuntu-only resources', 'Chapter mentorship'],
            monthlyPrice: 2499, // $24.99
            yearlyPrice: 24990, // $249.90 (approx 10 months)
        },
        {
            tier: CommunityTier.IMANI,
            name: 'Imani Leadership',
            description: 'Advanced leadership and strategy participation.',
            perks: ['Apply for leadership roles', 'Monthly strategy webinars', 'Priority event access'],
            monthlyPrice: 4999, // $49.99
            yearlyPrice: 49990, // $499.90
        },
        {
            tier: CommunityTier.KIONGOZI,
            name: 'Kiongozi Business',
            description: 'Business tier for enterprise and policy influencers.',
            perks: ['Business profile listing', 'Access to investor portal', 'Strategic advisory board access'],
            monthlyPrice: 9999, // $99.99
            yearlyPrice: 99990, // $999.90
        }
    ];

    for (const t of tiers) {
        await MembershipTier.findOrCreate({
            where: { tier: t.tier },
            defaults: t as any
        });
    }

    // Seed Initial Discounts
    const discounts = [
        {
            code: 'ANNUAL1FREE',
            name: 'Annual Free Month',
            discountType: DiscountType.FIXED,
            value: 2500,
            duration: DiscountDuration.ONCE,
        },
        {
            code: 'WELCOMETATT',
            name: 'Welcome 10%',
            discountType: DiscountType.PERCENTAGE,
            value: 10,
            duration: DiscountDuration.REPEATING,
            durationMonths: 3,
        }
    ];

    for (const d of discounts) {
        await Discount.findOrCreate({
            where: { code: d.code },
            defaults: d as any
        });
    }

    console.log('Membership seeds completed successfully.');
    await app.close();
}

seed().catch(err => {
    console.error('Seed failed', err);
    process.exit(1);
});
