import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule], // Import AuthModule to make AuthService available
  providers: [MembershipsService],
  controllers: [MembershipsController],
})
export class MembershipsModule {}