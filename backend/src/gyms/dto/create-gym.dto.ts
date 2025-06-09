import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGymDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  // Add other relevant fields for gym creation
  // @IsString()
  // description?: string;
}