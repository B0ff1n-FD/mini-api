import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Provider, User } from '@prisma/client';

@Injectable()
export class ValidateProvider implements PipeTransform<any> {
  transform(user: User) {
    if (user.provider !== Provider.local) {
      throw new BadRequestException('Validation failed (only available for Local Provider profile)');
    }
    return user;
  }
}
