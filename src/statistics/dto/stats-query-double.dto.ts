import { Prisma } from '@prisma/client';
import { StatsFields } from '@statistics/enums/stats-fields.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class StatsQueryDoubleDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsEnum(StatsFields)
  mainField: StatsFields;

  @IsEnum(Prisma.SortOrder)
  mainSortOrder: Prisma.SortOrder;

  @IsEnum(StatsFields)
  secondField: StatsFields;

  @IsEnum(Prisma.SortOrder)
  secondSortOrder: Prisma.SortOrder;

  @IsPositive()
  @Type(() => Number)
  limit: number;
}
