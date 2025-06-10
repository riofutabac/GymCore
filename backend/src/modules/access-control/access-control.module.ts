import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
import { QrGeneratorService } from './qr-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserContextService } from '../../common/services/user-context.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccessControlController],
  providers: [AccessControlService, QrGeneratorService, UserContextService],
  exports: [AccessControlService, QrGeneratorService],
})
export class AccessControlModule {}