import { UsersModule } from '../users/users.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { STRATEGIES } from './strategies';
import { GUARDS } from '@auth/guards';
import { jwtOptions } from './config/jwt-module-options';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
  imports: [PassportModule, UsersModule, JwtModule.registerAsync(jwtOptions())],
})
export class AuthModule {}
