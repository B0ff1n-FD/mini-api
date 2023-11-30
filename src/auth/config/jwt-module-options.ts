import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

const DEFAULT_EXP_TOKEN = '1h';

export const jwtOptions = (): JwtModuleAsyncOptions => ({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET_KEY'),
    signOptions: {
      expiresIn: configService.get('EXP_TOKEN', DEFAULT_EXP_TOKEN),
    },
  }),
  inject: [ConfigService],
});
