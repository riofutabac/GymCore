import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto extends LoginDto {
  // Additional fields for registration if needed, e.g., name
  // @IsNotEmpty()
  // @IsString()
  // name: string;
}