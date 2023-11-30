import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './config/multer-module-options';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UsersModule } from '@users/users.module';

@Module({
  controllers: [FilesController],
  imports: [UsersModule, MulterModule.registerAsync(multerOptions())],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
