import { Sequelize } from 'sequelize-typescript';
import { User } from './src/modules/iam/entities/user.entity';
import { CommunityIndustry } from './src/modules/industries/entities/industry.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'tatt_db',
    models: [User, CommunityIndustry],
    logging: console.log,
  });

  try {
    // We need to check if the 'industry' column still exists in case sync dropped it
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'industry'
    `);

    if (results.length === 0) {
      console.error("ERROR: 'industry' column is missing! It might have been dropped by Sequelize sync.");
      process.exit(1);
    }

    console.log("Starting industry migration...");

    // 1. Get all users with an industry string
    const usersWithIndustry = await sequelize.query(
      'SELECT id, "industry" FROM users WHERE "industry" IS NOT NULL AND "industry" != \'\''
    );

    const rows = usersWithIndustry[0] as { id: string, industry: string }[];
    console.log(`Found ${rows.length} users with legacy industry strings.`);

    // 2. Create unique industries
    const uniqueIndustries = Array.from(new Set(rows.map(r => r.industry)));
    console.log(`Unique industries to create: ${uniqueIndustries.length}`);

    for (const name of uniqueIndustries) {
      await CommunityIndustry.findOrCreate({ where: { name } });
    }

    // 3. Map industries to IDs
    const allIndustries = await CommunityIndustry.findAll();
    const industryMap = new Map(allIndustries.map(i => [i.name, i.id]));

    // 4. Update users
    for (const row of rows) {
      const industryId = industryMap.get(row.industry);
      if (industryId) {
        await sequelize.query(
          'UPDATE users SET "industryId" = :industryId WHERE id = :userId',
          {
            replacements: { industryId, userId: row.id }
          }
        );
      }
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sequelize.close();
  }
}

migrate();
