import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

interface AccessLog {
  userId: string;
  timestamp: number;
  isValid: boolean;
  validationTime: number;
}

@Injectable()
export class AccessControlService {
  private accessLogs: AccessLog[] = []; // Simple in-memory log

  async generateDynamicQR(userId: string): Promise<string> {
    const qrData = `${userId}-${Date.now()}`; // Combine userId and timestamp
    return QRCode.toDataURL(qrData);
  }

  async validateQR(qrData: string): Promise<AccessLog> {
    const [userId, timestampStr] = qrData.split('-');
    const timestamp = parseInt(timestampStr, 10);
    const currentTime = Date.now();
    const validationTime = currentTime;

    // Basic validation: Check if the timestamp is within a reasonable time frame (e.g., 5 minutes)
    const expiryTime = 30 * 1000; // 30 seconds in milliseconds
    const isValid = (currentTime - timestamp) <= expiryTime;

    const logEntry: AccessLog = {
      userId,
      timestamp,
      isValid,
      validationTime,
    };

    this.accessLogs.push(logEntry); // Log the access attempt

    return logEntry;
  }
}