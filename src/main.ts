import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import * as cookieParser from 'cookie-parser';
import { Endpoints } from '@common/constants';
import { AllExceptionsFilter } from '@common/exceptions';

async function init() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, always: true, transform: true }),
  );

  const logger = new Logger(init.name);
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('PORT', 5100);
  const uploadPath = configService.get<string>('UPLOAD_LOCATION');
  const UPLOAD_DIR = join(resolve(), uploadPath);

  app.useStaticAssets(UPLOAD_DIR, { index: false, prefix: `/${Endpoints.FILES}` });

  const config = new DocumentBuilder()
    .setTitle('Mini Backend')
    .setDescription('REST API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'apiKey',
        scheme: 'bearer',
        description: 'Enter your token in format "Bearer token". <br>e.g. <b>Bearer aBcD123...</b>',
        name: 'Authorization',
        in: 'header',
        bearerFormat: 'JWT',
      },
      'Bearer',
    )
    .addSecurityRequirements('Bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  process.on('unhandledRejection', async (err) => {
    logger.error(`Unhandled Rejection ${err}`);
  });

  process.on('uncaughtException', async (err) => {
    logger.error(`Uncaught Exception ${err.name} ${err.message}`);
    process.exit(1);
  });

  await app.listen(PORT);
  logger.debug(`Application is running on: ${await app.getUrl()}`);
}

init();
