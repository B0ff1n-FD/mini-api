import { Body, ClassSerializerInterceptor, Controller, Get } from '@nestjs/common';
import { Delete, Param, Put, UseFilters, UseInterceptors } from '@nestjs/common/decorators';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger/dist';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { UserEntity } from './entities/user.entity';
import { FilesService } from '@files/files.service';
import { UserPayload } from '@auth/interfaces/interfaces';
import { Endpoints, ResponseMessages } from '@common/constants';
import { ValidateMongoId, ValidateProvider } from '@common/validations';
import { PrismaExceptionFilter } from '@common/exceptions';
import { Access, CurrentUser, ErrorResponse, NoContentResponse } from '@common/decorators';

@ApiTags('Users')
@Controller(Endpoints.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED })
export class UsersController {
  constructor(
    private usersService: UsersService,
    private filesService: FilesService,
  ) {}

  @ApiOperation({ summary: 'Get All Users' })
  @ApiOkResponse({ description: 'All users on server' })
  @Get('')
  async getAll() {
    const users = await this.usersService.getAllUsers();
    return users.map((user) => new UserEntity(user));
  }

  @Access('User')
  @ApiOperation({ summary: 'Get User By Id' })
  @ApiOkResponse({ description: 'Found user' })
  @ErrorResponse('User')
  @Get(':userId')
  async getUser(@Param('userId', ValidateMongoId) id: string) {
    const user = await this.usersService.getUserById(id);
    return new UserEntity(user);
  }

  @Access('User')
  @UseFilters(new PrismaExceptionFilter('User'))
  @ApiOperation({ summary: 'Update User by ID' })
  @ApiOkResponse({ description: 'User updated' })
  @ErrorResponse('User')
  @Put(':userId')
  async update(
    @CurrentUser(ValidateProvider) user: UserPayload,
    @Body() userDto: UpdateUserDto,
    @Param('userId', ValidateMongoId) userId: string,
  ) {
    const updateUser = await this.usersService.updateUser(userId, userDto, user.password);
    return new UserEntity(updateUser);
  }

  @Access('User')
  @UseFilters(new PrismaExceptionFilter('User'))
  @NoContentResponse('User')
  @ErrorResponse('User')
  @Delete(':userId')
  async remove(@Param('userId', ValidateMongoId) userId: string) {
    const user = await this.usersService.removeUser(userId);

    if (user?.image) {
      await this.filesService.removeFile(user.image);
    }

    return new UserEntity(user);
  }
}
