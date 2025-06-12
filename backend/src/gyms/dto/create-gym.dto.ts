import { IsString, IsOptional, IsEmail, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymDto {
  @ApiProperty({ description: 'Nombre del gimnasio', example: 'Fitness Center' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Dirección del gimnasio', example: 'Calle Principal 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Teléfono de contacto', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Email de contacto', example: 'info@fitnesscenter.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Descripción del gimnasio', example: 'Gimnasio con equipamiento moderno', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Estado de actividad del gimnasio', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'ID del gerente asignado al gimnasio', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;
}