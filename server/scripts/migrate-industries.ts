import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { User } from '../src/modules/iam/entities/user.entity';
import { CommunityIndustry } from '../src/modules/industries/entities/industry.entity';
import { Chapter } from '../src/modules/chapters/entities/chapter.entity';
import { ProfessionalInterest } from '../src/modules/interests/entities/interest.entity';
import { UserInterest } from '../src/modules/interests/entities/user-interest.entity';
import { Connection } from '../src/modules/connections/entities/connection.entity';
import { Post } from '../src/modules/feed/entities/post.entity';
import { PostLike } from '../src/modules/feed/entities/post-like.entity';
import { PostComment } from '../src/modules/feed/entities/post-comment.entity';
import { DirectMessage } from '../src/modules/messages/entities/direct-message.entity';
import { Notification } from '../src/modules/notifications/entities/notification.entity';
import { VolunteerStat } from '../src/modules/volunteers/entities/volunteer-stat.entity';
import { VolunteerApplication } from '../src/modules/volunteers/entities/volunteer-application.entity';
import { SupportTicket } from '../src/modules/support/entities/support-ticket.entity';
import { SupportMessage } from '../src/modules/support/entities/support-message.entity';
import { SupportFaq } from '../src/modules/support/entities/support-faq.entity';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'tatt_db',
        models: [
            User, CommunityIndustry, Chapter, ProfessionalInterest, UserInterest, 
            Connection, Post, PostLike, PostComment, DirectMessage, Notification, 
            VolunteerStat, VolunteerApplication, SupportTicket, SupportMessage, SupportFaq
        ],
        logging: console.log,
    });

    try {
        await sequelize.authenticate();
        console.log('Database connection established for migration.');

        // 1. Get unique industries from the legacy string column
        // Note: we use raw query because the 'industry' column is no longer in the User model
        const [results] = await sequelize.query('SELECT DISTINCT "industry" FROM "users" WHERE "industry" IS NOT NULL AND "industry" != \'\'');
        
        const legacyIndustries = results.map((r: any) => r.industry);
        console.log(`Found ${legacyIndustries.length} unique legacy industries:`, legacyIndustries);

        for (const industryName of legacyIndustries) {
            // 2. Create or find the industry in the new taxonomy
            const [industry] = await CommunityIndustry.findOrCreate({
                where: { name: industryName },
                defaults: { name: industryName } as any
            });

            console.log(`Mapping "${industryName}" to ID: ${industry.id}`);

            // 3. Update all users who had this string industry
            await sequelize.query(
                'UPDATE "users" SET "industryId" = :industryId WHERE "industry" = :industryName',
                {
                    replacements: { industryId: industry.id, industryName },
                }
            );
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
