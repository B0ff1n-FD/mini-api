import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnprocessableEntityException,
  InternalServerErrorException,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FilesService } from '@files/files.service';

type Exceptions =
  | UnprocessableEntityException
  | InternalServerErrorException
  | BadRequestException
  | PayloadTooLargeException;

@Catch(UnprocessableEntityException, InternalServerErrorException, BadRequestException, PayloadTooLargeException)
export class RemoveFileOnErrorFilter implements ExceptionFilter {
  constructor(private filesService: FilesService) {}

  async catch(exception: Exceptions, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const status = exception.getStatus();
    const response = ctx.getResponse<Response>();
    const { file } = ctx.getRequest<Request>();

    if (file) {
      await this.filesService.removeFile(file.path);
    }

    response.status(status).json(exception.getResponse());
  }
}
