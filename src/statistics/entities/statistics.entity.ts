import { Exclude } from 'class-transformer';

export class StatisticsEntity {
  id: string;
  createdAt: Date;
  level: number;

  totalTime: string;

  score: number;

  other: string;

  @Exclude()
  userId: string;

  @Exclude()
  productId: string;

  constructor(partial: Partial<StatisticsEntity>) {
    Object.assign(this, partial);
  }
}
