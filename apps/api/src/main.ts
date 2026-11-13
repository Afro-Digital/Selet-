import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Permissive for local Swagger UI & internal Playwright PDF generation
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback in development
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // OpenAPI (Swagger) Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Selet (ስሌት) API')
    .setDescription(
      'Open-source software project cost estimation, margin balancing, and pricing API for Ethiopia.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`Selet API is running on port ${port}`);
  console.log(`OpenAPI documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
