import { ClassSerializerInterceptor, Controller, Get, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { Delete, HttpCode, Param, Req, Res, UseFilters, UseInterceptors } from '@nestjs/common/decorators';
import { Express } from 'express';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger/dist';
import { ConfigService } from '@nestjs/config';
import { ApiFile, CustomUploadedFile } from './decorators';
import { Response, Request } from 'express';
import { User } from '@prisma/client';
import { URL } from 'node:url';
import { FilesService } from './files.service';
import { RemoveFileOnErrorFilter } from './exceptions/upload-exception.filter';
import { ValidateMongoId, ValidateProvider } from '@common/validations';
import { PrismaExceptionFilter } from '@common/exceptions';
import { NotFoundInterceptor } from '@common/interceptors';
import { Access, CurrentUser, ErrorResponse, NoCache } from '@common/decorators';
import { Endpoints, ResponseMessages } from '@common/constants';
import { UserEntity } from '@users/entities/user.entity';
import { UsersService } from '@users/users.service';
import { basename } from 'node:path';

@ApiTags('Files')
@Controller(Endpoints.FILES)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new PrismaExceptionFilter('User'))
@ApiUnauthorizedResponse({ description: `${ResponseMessages.UNAUTHORIZED}` })
export class FilesController {
  constructor(
    private readonly configService: ConfigService,
    private filesService: FilesService,
    private usersService: UsersService,
  ) {}

  @UseInterceptors(new NotFoundInterceptor('User'))
  @ApiOperation({ summary: 'Upload User Image' })
  @ApiCreatedResponse({ description: 'Uploaded Image' })
  @ApiUnprocessableEntityResponse({ description: 'Unprocessable Entity' })
  @ErrorResponse('User')
  @Post('upload')
  @ApiFile()
  @UseFilters(RemoveFileOnErrorFilter)
  async uploadImage(
    @CustomUploadedFile()
    file: Express.Multer.File,
    @CurrentUser(ValidateProvider) user: User,
    @Req() req: Request,
  ) {
    const { id: userId, image, password } = user;
    const imageUrl = new URL(`${req.protocol}:${req.get('Host')}/${Endpoints.FILES}/${file.filename}`).href;

    const updateUser = await this.usersService.updateUser(userId, { image: imageUrl }, password);

    if (updateUser && image) {
      await this.filesService.removeFile(image);
      return new UserEntity(updateUser);
    }
  }

  @Access('User')
  @ApiOperation({ summary: 'Delete User Image' })
  @ErrorResponse('User')
  @ApiNoContentResponse({ description: 'Image deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async removeImage(@Param('userId', ValidateMongoId) userId: string) {
    const { password, image } = await this.usersService.getUserById(userId);
    const updateUser = await this.usersService.updateUser(userId, { image: null }, password);

    if (updateUser && image) {
      await this.filesService.removeFile(image);
      return new UserEntity(updateUser);
    }
  }

  @NoCache()
  @ApiOperation({ summary: 'Get Image' })
  @ApiOkResponse({ description: 'Uploaded Image' })
  @ApiNotFoundResponse({ description: `Image ${ResponseMessages.NOT_FOUND}` })
  @Get(':userId')
  async getImage(@Param('userId') userId: string, @Res() res: Response) {
    const { image } = await this.usersService.getUserById(userId);

    if (!image) {
      throw new NotFoundException();
    }

    const imageName = basename(image);
    res.sendFile(imageName, { root: this.configService.get('UPLOAD_LOCATION') });
  }
}
