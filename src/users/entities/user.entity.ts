import { Exclude } from 'class-transformer';
import { Provider, Stats } from '@prisma/client';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  refreshToken?: string;
  image?: string;
  statistics?: Stats[];

  @Exclude()
  password: string;

  @Exclude()
  roleIDs: string[];

  provider: Provider;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
