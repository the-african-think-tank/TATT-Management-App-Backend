import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
    console.log('\n--- TATT Manual Migration Runner ---');
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

    try {
        const sequelize = app.get(Sequelize);
        const migrationsDir = path.join(__dirname, 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            console.log('No migrations directory found.');
            return;
        }

        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
        
        for (const file of files) {
            console.log(`\nApplying migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            
            // Execute each command separately if they are separated by -- delimiter?
            // Actually, we can try executing the whole block.
            // But ENUM ALTER TYPE must be outside transactions.
            // Sequelize queries are usually in transactions.
            
            await sequelize.query(sql);
            console.log(`Successfully applied ${file}`);
        }

        console.log('\nAll production migrations applied successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

runMigrations();
