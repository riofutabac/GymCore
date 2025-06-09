import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { QrGeneratorService } from './qr-generator.service';
import { Request } from 'express';

@Controller('access-control')
export class AccessControlController {
  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly qrGeneratorService: QrGeneratorService,
  ) {}

  @Get('my-qr')
  async getMyQr(@Req() req: Request): Promise<string> {
    // Assuming user information is available in the request, e.g., through authentication
    const userId = req.user['id']; // Adjust based on how your authentication provides the user ID
    return this.qrGeneratorService.generateDynamicQR(userId);
  }

  @Post('validate-qr')
  async validateQr(@Body('qrCode') qrCode: string): Promise<any> {
    return this.accessControlService.validateQR(qrCode);
  }
}