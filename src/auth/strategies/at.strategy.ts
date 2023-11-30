import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/interfaces';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(AtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.getUserById(payload.id).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
