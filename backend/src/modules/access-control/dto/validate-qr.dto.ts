import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateQRDto {
  @IsString()
  @IsNotEmpty()
  qrData: string;
}
