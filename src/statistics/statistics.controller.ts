import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { StatisticsEntity, StatisticsProductEntity, StatisticsUserEntity } from './entities';
import { CreateStatisticsDto, StatsQueryDoubleDto, StatsQueryOneDto } from './dto';
import { ApiStatsQueryDouble, ApiStatsQueryOne } from './decorators';
import { Endpoints, ResponseMessages } from '@common/constants';
import { Access, CurrentUser, ErrorResponse, NoContentResponse } from '@common/decorators';
import { ValidateMongoId, ValidatePayloadExists } from '@common/validations';
import { NotFoundInterceptor } from '@common/interceptors';
import { PrismaExceptionFilter } from '@common/exceptions';
import { Prisma } from '@prisma/client';

@ApiTags('Statistics')
@Controller(Endpoints.STATISTIC)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED })
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @ApiOperation({ summary: 'Get All statistics' })
  @ApiOkResponse({ description: 'All statistics' })
  @Get()
  async getAll() {
    const stats = await this.statisticsService.findMany();
    return stats.map((item) => new StatisticsEntity(item));
  }

  @UseInterceptors(new NotFoundInterceptor('Statistics'))
  @ApiOperation({ summary: 'Get Statistics by ID' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ErrorResponse('Statistics')
  @Get(':statsId')
  async getStatistics(@Param('statsId', ValidateMongoId) id: string) {
    const stats = await this.statisticsService.findOne(id);
    return new StatisticsEntity(stats);
  }

  @Access('Statistics')
  @UseFilters(new PrismaExceptionFilter('Statistics'))
  @NoContentResponse('Statistics')
  @ErrorResponse('Statistics')
  @Delete(':statsId')
  async remove(@Param('statsId', ValidateMongoId) id: string) {
    const stats = await this.statisticsService.deleteById(id);
    return new StatisticsEntity(stats);
  }

  @UseFilters(new PrismaExceptionFilter('Product or User'))
  @ApiOperation({ summary: 'Create statistics' })
  @ApiCreatedResponse({ description: 'Created statistics' })
  @ErrorResponse('Product or User')
  @Post('products/:productId')
  async create(
    @CurrentUser('id') userId: string,
    @Param('productId', ValidateMongoId) productId: string,
    @Body(ValidatePayloadExists) statisticDto: CreateStatisticsDto,
  ) {
    const stats = await this.statisticsService.create(statisticDto, userId, productId);
    return new StatisticsEntity(stats);
  }

  @ApiOperation({ summary: 'Get Statistics by product' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ApiBadRequestResponse({ description: `${ResponseMessages.BAD_REQUEST}` })
  @Get('products/:productId')
  public async statsByProduct(@Param('productId', ValidateMongoId) productId: string) {
    const stats = await this.statisticsService.findByProductId(productId);
    return stats.map((item) => new StatisticsUserEntity(item));
  }

  @ApiStatsQueryOne()
  @ApiOperation({ summary: 'Get Product statistics filtered and sorted by selected field.' })
  @ApiOkResponse({ description: 'Get Product statistics filtered and sorted by selected field.' })
  @Get('products/:productId/sortByField')
  async productStatsByField(
    @Param('productId', ValidateMongoId) productId: string,
    @Query() queryParams: StatsQueryOneDto,
  ) {
    const isValidField = Prisma.StatsScalarFieldEnum.hasOwnProperty(queryParams.field);
    if (isValidField) {
      const stats = await this.statisticsService.productStatsByField(productId, queryParams);
      return stats.map((item) => new StatisticsUserEntity(item));
    }
    throw new BadRequestException();
  }

  @ApiStatsQueryDouble()
  @ApiOperation({ summary: 'Get Product statistics filtered and sorted by selected fields.' })
  @ApiOkResponse({ description: 'Filtered and Sorted statistics' })
  @Get('products/:productId/sortByFields')
  async productStatsByFields(
    @Param('productId', ValidateMongoId) productId: string,
    @Query() queryParams: StatsQueryDoubleDto,
  ) {
    const { mainField, secondField } = queryParams;
    const isValidFields =
      Prisma.StatsScalarFieldEnum.hasOwnProperty(mainField) && Prisma.StatsScalarFieldEnum.hasOwnProperty(secondField);

    if (isValidFields) {
      const stats = await this.statisticsService.productStatsByFields(productId, queryParams);
      return stats.map((item) => new StatisticsUserEntity(item));
    }
    throw new BadRequestException();
  }

  @Access('User')
  @ApiOperation({ summary: 'Get Statistics by user' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ErrorResponse('Products')
  @Get('users/:userId')
  public async statsBysUser(@Param('userId', ValidateMongoId) userId: string) {
    const stats = await this.statisticsService.findByUserId(userId);
    return stats.map((item) => new StatisticsProductEntity(item));
  }

  @Access('User or Product')
  @ApiQuery({ name: 'productId', type: String })
  @ApiOperation({ summary: 'Get user statistics by product' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ErrorResponse('Products')
  @Get('users/:userId/products/:productId')
  public async userStatsByProduct(
    @Param('userId', ValidateMongoId) userId: string,
    @Param('productId', ValidateMongoId) productId: string,
  ) {
    const stats = await this.statisticsService.userStatsByProductId(userId, productId);
    return stats.map((item) => new StatisticsProductEntity(item));
  }

  @ApiStatsQueryOne()
  @ApiQuery({ name: 'productId', type: String })
  @ApiOperation({ summary: 'Get User statistics by product filtered and sorted by selected field.' })
  @ApiOkResponse({ description: 'Filtered and Sorted statistics' })
  @Get('users/:userId/sortByField')
  async userStatsByField(@Param('userId', ValidateMongoId) userId: string, @Query() queryParams: StatsQueryOneDto) {
    const isValidField = Prisma.StatsScalarFieldEnum.hasOwnProperty(queryParams.field);
    if (isValidField) {
      const stats = await this.statisticsService.userStatsByField(userId, queryParams);
      return stats.map((item) => new StatisticsProductEntity(item));
    }
    throw new BadRequestException();
  }

  @ApiStatsQueryDouble()
  @ApiQuery({ name: 'productId', type: String })
  @ApiOperation({ summary: 'Get User statistics by product filtered and sorted by selected fields.' })
  @ApiOkResponse({ description: 'Filtered and Sorted statistics.' })
  @Get('users/:userId/sortByFields')
  async userStatsByFields(@Param('userId', ValidateMongoId) userId: string, @Query() queryParams: StatsQueryDoubleDto) {
    const { mainField, secondField } = queryParams;
    const isValidFields =
      Prisma.StatsScalarFieldEnum.hasOwnProperty(mainField) && Prisma.StatsScalarFieldEnum.hasOwnProperty(secondField);

    if (isValidFields) {
      const stats = await this.statisticsService.userStatsByFields(userId, queryParams);
      return stats.map((item) => new StatisticsProductEntity(item));
    }
    throw new BadRequestException();
  }
}
