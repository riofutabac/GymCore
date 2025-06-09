import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you have a PrismaService

@Module({
  controllers: [MembershipsController],
  providers: [MembershipsService, PrismaService],
  exports: [MembershipsService],
})
export class MembershipsModule {}