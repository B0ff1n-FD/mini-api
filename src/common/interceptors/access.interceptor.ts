import { ResponseMessages } from '@common/constants';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { StatisticsEntity } from '@statistics/entities/statistics.entity';
import { UserEntity } from '@users/entities/user.entity';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AccessInterceptor implements NestInterceptor {
  constructor(private name: string) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { id: userId, roles } = request.user;
    const isAdmin = roles.includes(UserRole.Admin);

    return next.handle().pipe(
      tap((data) => {
        if (!data || !Object.keys(data).length) {
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: `${this.name} ${ResponseMessages.NOT_FOUND}`,
          });
        }
        if (!isAdmin) {
          let isOwner = true;

          if (data instanceof UserEntity) {
            isOwner = userId === data.id;
          }

          if (Array.isArray(data) && data[0] instanceof StatisticsEntity) {
            isOwner = userId === data[0].userId;
          }

          if (!isOwner) {
            throw new ForbiddenException({
              statusCode: HttpStatus.FORBIDDEN,
              message: `${ResponseMessages.FORBIDDEN}`,
            });
          }
        }
      }),
    );
  }
}
