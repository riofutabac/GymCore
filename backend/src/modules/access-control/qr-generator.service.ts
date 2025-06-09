import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrGeneratorService {
  async generateDynamicQR(userId: string): Promise<string> {
    const qrData = `${userId}-${Date.now()}`; // Combine userId and timestamp
    return QRCode.toDataURL(qrData);
  }
}