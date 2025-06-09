import { Injectable } from '@nestjs/common';

@Injectable()
export class QrGeneratorService {
  async generateDynamicQR(userId: string): Promise<string> {
    const qrData = `${userId}-${Date.now()}`;
    // Return a mock base64 QR code data URL
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  }
}