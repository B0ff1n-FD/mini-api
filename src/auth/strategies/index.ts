import { LocalStrategy } from './local.strategy';
import { AtStrategy } from './at.strategy';
import { GoogleStrategy } from './google.strategy';
import { YandexStrategy } from './yandex.strategy';
import { GitHubStrategy } from './github.strategy';

export const STRATEGIES = [AtStrategy, LocalStrategy, GoogleStrategy, YandexStrategy, GitHubStrategy];
