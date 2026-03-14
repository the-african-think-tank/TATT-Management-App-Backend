import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ResourcesController } from './src/modules/resources/resources.controller';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const controller = app.get(ResourcesController);
  try {
    const result = await controller.getStats({ user: { id: 'test', systemRole: 'ADMIN' } } as any);
    console.log('Result:', result);
  } catch (e) {
    console.error('Error:', e.message);
  }
  await app.close();
  process.exit(0);
}
bootstrap();
