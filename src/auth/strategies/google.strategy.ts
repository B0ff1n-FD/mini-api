import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Provider } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'), // get the ID from Google Cloud Console
      clientSecret: configService.get('GOOGLE_SECRET'), // get the SECRET from Google Cloud Console
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<any> {
    const { name, emails, photos, provider } = profile;
    const user = {
      email: emails[0].value || '',
      name: name.givenName || null,
      image: photos[0].value || null,
      provider: provider || Provider.google,
    };
    done(null, user);
  }
}
