import { UseInterceptors } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { AccessInterceptor } from '@common/interceptors';
import { ResponseMessages } from '@common/constants';

export function Access(name: string) {
  return applyDecorators(
    UseInterceptors(new AccessInterceptor(name)),
    ApiForbiddenResponse({ description: ResponseMessages.FORBIDDEN }),
  );
}
