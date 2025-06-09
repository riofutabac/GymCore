import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuthService],
  exports: [AuthService], // Ensure AuthService is exported
})
export class AuthModule {}