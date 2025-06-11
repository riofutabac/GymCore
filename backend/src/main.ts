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
  
  // CORS Configuration - Agregar IP de Radmin
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      `http://${process.env.RADMIN_IP}:3000`, // Frontend en Radmin
      `http://${process.env.RADMIN_IP}:3001`, // Backend en Radmin
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe with enhanced configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: ['/health'],
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('GymCore API')
    .setDescription('API para gestión de gimnasios')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Configuración del servidor
  const PORT = process.env.PORT || 3001;
  const HOST = process.env.SERVER_HOST || '0.0.0.0';

  await app.listen(PORT, HOST);

  // Logs informativos
  logger.log(`🚀 Backend running on http://${HOST}:${PORT}`);
  logger.log(`🌐 Radmin VPN access: http://${process.env.RADMIN_IP}:${PORT}`);
  logger.log(`📖 API endpoints available at http://${HOST}:${PORT}/api`);
  logger.log(`🔐 Auth endpoints: http://${HOST}:${PORT}/api/auth/login`);
  logger.log(`🔐 Auth endpoints: http://${HOST}:${PORT}/api/auth/register`);
  logger.log(`❤️ Health check: http://${HOST}:${PORT}/health`);
  logger.log(`📋 API docs: http://${HOST}:${PORT}/api/docs`);
  logger.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});