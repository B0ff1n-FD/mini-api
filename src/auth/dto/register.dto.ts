import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@mail.com', description: 'User Email' })
  @IsString()
  @IsEmail({}, { message: 'Incorrect email' })
  readonly email: string;

  @ApiPropertyOptional({ example: 'User', description: 'User Name' })
  @IsString()
  @Length(4, 12, { message: 'Name length min 4, max 12' })
  readonly name: string;

  @ApiPropertyOptional({ example: '1234User', description: 'User Password' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'password length min 4' })
  readonly password?: string;
}
