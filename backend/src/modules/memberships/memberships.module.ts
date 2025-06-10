import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserContextService } from '../../common/services/user-context.service';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipsController],
  providers: [MembershipsService, UserContextService],
  exports: [MembershipsService],
})
export class MembershipsModule {}