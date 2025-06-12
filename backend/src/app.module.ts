import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GymsModule } from './gyms/gyms.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { LoggerModule } from './common/logger/logger.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { MembersModule } from './modules/members/members.module';
import { ChatModule } from './modules/chat/chat.module'; // Importa el nuevo módulo

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    GymsModule,
    MembershipsModule,
    InventoryModule,
    AccessControlModule,
    MembersModule,
    ChatModule, // Agrega el nuevo módulo
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
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}