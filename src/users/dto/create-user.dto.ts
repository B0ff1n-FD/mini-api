import { RegisterDto } from '@auth/dto';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto extends RegisterDto {
  @IsOptional()
  @IsString()
  readonly refreshToken?: string;

  @IsOptional()
  @IsString()
  readonly image?: string;
}
