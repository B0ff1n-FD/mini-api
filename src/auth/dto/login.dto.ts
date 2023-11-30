import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@mail.com', description: 'User Email' })
  @IsString()
  @IsEmail({}, { message: 'Incorrect email' })
  readonly email: string;

  @ApiPropertyOptional({ example: '1234User', description: 'User Password' })
  @IsOptional()
  @IsString()
  @Length(4, 16, { message: 'password length min 4, max 16' })
  readonly password?: string;
}
