import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { QrGeneratorService } from '../qr-generator/qr-generator.service';

@Module({
  imports: [],
  providers: [AccessControlService, QrGeneratorService],
  exports: [AccessControlService, QrGeneratorService],
})
export class AccessControlModule {}