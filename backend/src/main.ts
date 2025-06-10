import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  
  // CORS Configuration
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe with enhanced configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed validation errors in production
    }),
  );

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: ['/health'], // Health check endpoint without prefix
  });

<<<<<<< HEAD
  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('GymCore API')
    .setDescription('API para gestión de gimnasios')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Puerto del backend
  const port = process.env.PORT || 3001;
=======
  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  const port = configService.get<number>('PORT') || 3001;
  
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
  await app.listen(port);
  
  logger.log(`🚀 Backend running on http://localhost:${port}`);
  logger.log(`📖 API endpoints available at http://localhost:${port}/api`);
  logger.log(`🔐 Auth endpoints: http://localhost:${port}/api/auth/login`);
  logger.log(`🔐 Auth endpoints: http://localhost:${port}/api/auth/register`);
  logger.log(`❤️ Health check: http://localhost:${port}/health`);
  logger.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});