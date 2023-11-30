import { HttpStatus, ParseFilePipe, UploadedFile } from '@nestjs/common';
import { ImageSizeValidator, ImageTypeValidator } from '../validations';

// Validation max size image *KiB
const IMAGE_MAX_SIZE = 100;

// Type ext and Magic number https://en.wikipedia.org/wiki/Magic_number_%28programming%29
const FILE_TYPES = { jpg: 'ffd8ffe0', jpeg: 'ffd8ffe1', png: '89504e47', gif: '47494638' };

export function CustomUploadedFile() {
  return UploadedFile(
    new ParseFilePipe({
      validators: [
        new ImageSizeValidator({ fileSize: IMAGE_MAX_SIZE }),
        new ImageTypeValidator({ fileTypes: FILE_TYPES }),
      ],
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
}
