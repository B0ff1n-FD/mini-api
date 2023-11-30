import { Prisma } from '@prisma/client';
import { StatsFields } from '@statistics/enums/stats-fields.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class StatsQueryOneDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsEnum(StatsFields)
  field: StatsFields;

  @IsEnum(Prisma.SortOrder)
  sortOrder: Prisma.SortOrder;

  @IsPositive()
  @Type(() => Number)
  limit: number;
}
