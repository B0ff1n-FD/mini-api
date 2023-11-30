import { UserEntity } from '@users/entities/user.entity';
import { StatisticsEntity } from './statistics.entity';

export class StatisticsUserEntity extends StatisticsEntity {
  user: Partial<UserEntity>;

  constructor(partial: Partial<StatisticsUserEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
