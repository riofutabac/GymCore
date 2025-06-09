import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class RenewMembershipDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['CASH', 'CARD', 'TRANSFER', 'STRIPE', 'OTHER'])
  paymentMethod: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  paymentInfo?: any;
}