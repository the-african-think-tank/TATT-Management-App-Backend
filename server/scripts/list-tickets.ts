import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { SupportTicket } from '../src/modules/support/entities/support-ticket.entity';

async function check() {
    console.log('Listing all support tickets in DB...');
    const app = await NestFactory.createApplicationContext(AppModule);
    
    try {
        const sequelize = app.get(Sequelize);
        const tickets = await SupportTicket.findAll({ paranoid: false });
        
        console.log(`Found ${tickets.length} tickets total.`);
        tickets.forEach(t => {
            console.log(`- ID: ${t.id} | Number: ${t.ticketNumber} | Sub: ${t.subject} | Deleted: ${!!t.deletedAt}`);
        });

        console.log('Finished dump.');
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await app.close();
    }
}

check();
