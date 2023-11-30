import {
  Controller,
  Post,
  Body,
  Get,
  ValidationPipe,
  UseGuards,
  UnauthorizedException,
  Res,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Cookies, CurrentUser, Local, NoCache, ProviderRedirect, Public, UserAgent } from '@common/decorators';
import { PrismaExceptionFilter } from '@common/exceptions';
import { ResponseMessages } from '@common/constants';
import { RegisterDto, LoginDto } from './dto';
import { Tokens, UserProvider } from './interfaces/interfaces';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { YandexAuthGuard } from './guards/yandex-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { User } from '@prisma/client';

const REFRESH_TOKEN = 'jwt-refresh';

@Public()
@NoCache()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Local()
  @ApiOperation({ summary: 'SignIn' })
  @ApiCreatedResponse({ description: 'Successful login' })
  @Post('login')
  async signIn(
    @Body(new ValidationPipe({ validateCustomDecorators: true }))
    userDto: LoginDto,
    @Res() res: Response,
    @CurrentUser() user: User,
    @UserAgent() agent: string,
  ) {
    const tokens = await this.authService.generateTokens(user, agent);

    return this.setRefreshTokenToCookies(tokens, res);
  }

  @UseFilters(new PrismaExceptionFilter('Email'))
  @ApiOperation({ summary: 'SignUp' })
  @ApiCreatedResponse({ description: 'New user is created' })
  @ApiConflictResponse({ description: `Email ${ResponseMessages.CONFLICT}` })
  @ApiBadRequestResponse({ description: ResponseMessages.BAD_REQUEST })
  @Post('register')
  async signUp(@UserAgent() agent: string, @Body() authDto: RegisterDto) {
    const { accessToken } = await this.authService.signUp(authDto, agent);

    return { accessToken };
  }

  @ApiOperation({ summary: 'Google Auth' })
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @ProviderRedirect(GoogleAuthGuard)
  @Get('google/redirect')
  async googleAuthRedirect(@CurrentUser() user: UserProvider, @UserAgent() agent: string, @Res() res: Response) {
    const tokens = await this.authService.providerAuth(user, agent);

    return this.setRefreshTokenToCookies(tokens, res);
  }

  @ApiOperation({ summary: 'Yandex Auth' })
  @UseGuards(YandexAuthGuard)
  @Get('yandex')
  yandexAuth() {}

  @ProviderRedirect(YandexAuthGuard)
  @Get('yandex/redirect')
  async yandexAuthRedirect(@CurrentUser() user: UserProvider, @UserAgent() agent: string, @Res() res: Response) {
    const tokens = await this.authService.providerAuth(user, agent);

    return this.setRefreshTokenToCookies(tokens, res);
  }

  @ApiOperation({ summary: 'Github Auth' })
  @UseGuards(GithubAuthGuard)
  @Get('github')
  githubAuth() {}

  @ProviderRedirect(GithubAuthGuard)
  @Get('github/redirect')
  async githubAuthRedirect(@CurrentUser() user: UserProvider, @UserAgent() agent: string, @Res() res: Response) {
    const tokens = await this.authService.providerAuth(user, agent);

    return this.setRefreshTokenToCookies(tokens, res);
  }

  @ApiOperation({ summary: 'Update Tokens' })
  @ApiCreatedResponse({ description: 'Updated Tokens' })
  @ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED })
  @Get('refresh-tokens')
  async refreshTokens(@Cookies(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    return this.setRefreshTokenToCookies(tokens, res);
  }

  @UseFilters(new PrismaExceptionFilter('Refresh Token'))
  @ApiOperation({ summary: 'Destroy Refresh Token' })
  @ApiOkResponse({ description: 'Refresh Token removed' })
  @ApiNotFoundResponse({ description: `Refresh Token ${ResponseMessages.NOT_FOUND}` })
  @Get('logout')
  async logout(@Cookies(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }

    await this.authService.logout(refreshToken);

    res.clearCookie(REFRESH_TOKEN);
    res.sendStatus(HttpStatus.OK);
  }

  private async setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = tokens;
    const dateTimeInSeconds = this.authService.getTokenExp(refreshToken.token);

    res.cookie(REFRESH_TOKEN, refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: dateTimeInSeconds,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });

    res.status(HttpStatus.CREATED).json({ accessToken });
  }
}
