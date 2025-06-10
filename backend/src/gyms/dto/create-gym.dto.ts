import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymDto {
  @ApiProperty({ description: 'Nombre del gimnasio', example: 'Fitness Center' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Dirección del gimnasio', example: 'Calle Principal 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Descripción del gimnasio', example: 'Gimnasio con equipamiento moderno', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Teléfono de contacto', example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Email de contacto', example: 'info@fitnesscenter.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
  
  @ApiProperty({ description: 'ID del gerente asignado al gimnasio', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  managerId?: string;
}