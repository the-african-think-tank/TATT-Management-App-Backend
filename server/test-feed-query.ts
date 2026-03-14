import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { FeedService } from './src/modules/feed/feed.service';
import { FeedFilter } from './src/modules/feed/dto/feed.dto';
import { User } from './src/modules/iam/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const feedService = app.get(FeedService);
  const users = await User.findAll({ limit: 10 });
  
  for (const user of users) {
    console.log(`Testing feed for user role: ${user.systemRole} (ID: ${user.id})`);
    try {
      const result = await feedService.getFeed(user, { filter: FeedFilter.ALL, page: 1, limit: 10 } as any);
      console.log('  Success, found posts:', result.data.length);
    } catch (err) {
      console.error('  ERROR OCCURRED:', err.message);
    }
  }
  await app.close();
  process.exit(0);
}
bootstrap();
