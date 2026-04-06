import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { Event } from '../src/modules/events/entities/event.entity';
import { EventChapter } from '../src/modules/events/entities/event-chapter.entity';
import { Chapter } from '../src/modules/chapters/entities/chapter.entity';
import { EventType } from '../src/modules/events/enums/event-type.enum';
import { CommunityTier } from '../src/modules/iam/enums/roles.enum';

async function seed() {
    console.log('Seeding Test Event...');
    const app = await NestFactory.createApplicationContext(AppModule);
    
    try {
        const sequelize = app.get(Sequelize);
        
        // Find a chapter to attach the event to
        const chapter = await Chapter.findOne();
        if (!chapter) {
            console.error('No chapters found. Please seed chapters first.');
            return;
        }

        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + 7); // 7 days from now

        const [event, created] = await Event.findOrCreate({
            where: { title: 'Global Diaspora Strategy Summit' },
            defaults: {
                description: 'A high-level strategy intensive focusing on economic leverage within the African diaspora.',
                dateTime: eventDate,
                type: EventType.EVENT,
                isForAllMembers: true,
                basePrice: 150.00,
                targetMembershipTiers: [CommunityTier.UBUNTU, CommunityTier.IMANI, CommunityTier.KIONGOZI]
            }
        });

        if (created) {
            console.log(`Created Event: ${event.title}`);
            
            // Add location
            await EventChapter.create({
                eventId: event.id,
                chapterId: chapter.id,
                address: '123 Innovation Drive, Tech Center'
            });
            console.log(`Added location in Chapter: ${chapter.name}`);
        } else {
            console.log('Test event already exists.');
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await app.close();
    }
}

seed();
