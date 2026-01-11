import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { bootstrap } from './bootstrap';

async function startServer() {
  const app = await bootstrap();
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Restaurant Reservation API')
    .setDescription('API for managing restaurant tables and reservations')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
startServer();
