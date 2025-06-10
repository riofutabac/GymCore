import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GymMembershipDto {
  @ApiProperty({
    description: 'ID del gimnasio al que el usuario desea unirse',
    example: '5f8d0d55-e0a1-4ec1-b86c-9a1dc384b494',
  })
  @IsNotEmpty({ message: 'El ID del gimnasio es requerido' })
  @IsString({ message: 'El ID del gimnasio debe ser un string' })
  gymId: string;
}
