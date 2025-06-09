import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
import { QrGeneratorService } from './qr-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // Import AuthModule
  controllers: [AccessControlController],
  providers: [AccessControlService, QrGeneratorService],
  exports: [AccessControlService, QrGeneratorService],
})
export class AccessControlModule {}