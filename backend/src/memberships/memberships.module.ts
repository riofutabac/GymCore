import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { AuthModule } from '../auth/auth.module'; // Assuming AuthService is provided in AuthModule

@Module({
  imports: [AuthModule], // Import AuthModule
  providers: [MembershipsService],
  controllers: [MembershipsController],
})
export class MembershipsModule {}
