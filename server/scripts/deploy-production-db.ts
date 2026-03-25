import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { UserSeederService } from '../src/modules/iam/auth/user-seeder.service';
import { MembershipTier } from '../src/modules/membership/entities/membership-tier.entity';
import { Discount, DiscountType, DiscountDuration } from '../src/modules/membership/entities/discount.entity';
import { CommunityTier } from '../src/modules/iam/enums/roles.enum';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migration Script: Production Database Initialization
 * 
 * 1. Synchronizes the database schema (applies current table structure).
 * 2. Seeds initial membership tiers & discounts (if missing).
 * 3. Seeds the default admin account from .env (if missing).
 */
async function deploy() {
    console.log('\n--- TATT Production DB Deployment ---');

    console.log('1. Bootstrapping application context...');
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

    try {
        const sequelize = app.get(Sequelize);

        // This applies all entity structures (including new PostUpvote, PostBookmark, etc.)
        await sequelize.sync({ alter: true });
        console.log('Schema synchronized successfully.');

        console.log('3. Running manual SQL migrations (for ENUMs and complex schema changes)...');
        const migrationsDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql')).sort();
            for (const file of files) {
                console.log(`   - Applying: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await sequelize.query(sql);
            }
            console.log('   All manual migrations applied.');
        } else {
            console.log('   No manual migrations found.');
        }

        console.log('4. Seeding Membership Tiers...');
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
                monthlyPrice: 2499,
                yearlyPrice: 24990,
            },
            {
                tier: CommunityTier.IMANI,
                name: 'Imani Leadership',
                description: 'Advanced leadership and strategy participation.',
                perks: ['Apply for leadership roles', 'Monthly strategy webinars', 'Priority event access'],
                monthlyPrice: 4999,
                yearlyPrice: 49990,
            },
            {
                tier: CommunityTier.KIONGOZI,
                name: 'Kiongozi Business',
                description: 'Business tier for enterprise and policy influencers.',
                perks: ['Business profile listing', 'Access to investor portal', 'Strategic advisory board access'],
                monthlyPrice: 9999,
                yearlyPrice: 99990,
            }
        ];

        for (const t of tiers) {
            const [tier, created] = await MembershipTier.findOrCreate({
                where: { tier: t.tier },
                defaults: t as any
            });
            if (created) console.log(`   - Created ${t.name} tier`);
        }

        console.log('4. Seeding Initial Discounts...');
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
            const [disc, created] = await Discount.findOrCreate({
                where: { code: d.code },
                defaults: d as any
            });
            if (created) console.log(`   - Created discount: ${d.code}`);
        }

        console.log('5. Ensuring Admin Account exists...');
        const userSeeder = app.get(UserSeederService);
        // UserSeederService.onApplicationBootstrap() would run automatically,
        // but we can ensure it runs here if the context didn't trigger it fully.
        await (userSeeder as any).seedDefaultAdmin();
        
        console.log('\nDeployment process completed successfully.');
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

deploy();
