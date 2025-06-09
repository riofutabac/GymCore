import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GymsModule } from './gyms/gyms.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AccessControlModule } from './modules/access-control/access-control.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    GymsModule,
    MembershipsModule,
    InventoryModule,
    AccessControlModule,
  ],
})
export class AppModule {}