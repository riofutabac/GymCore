import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { GymsModule } from './gyms/gyms.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { UserEnrichmentInterceptor } from './common/interceptors/user-enrichment.interceptor';
import { MembersModule } from './modules/members/members.module';
import { ChatModule } from './modules/chat/chat.module';
import { LoggerModule } from 'nestjs-pino'; // Importa el nuevo módulo

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
                levelFirst: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname,req,res,responseTime',
                messageFormat: '{msg}',
              },
            }
          : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'info' : 'warn',
        serializers: {
          req: () => undefined,
          res: () => undefined,
        },
        autoLogging: false,
      },
    }),
    PrismaModule,
    AuthModule,
    GymsModule,
    MembershipsModule,
    InventoryModule,
    AccessControlModule,
    MembersModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserEnrichmentInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}