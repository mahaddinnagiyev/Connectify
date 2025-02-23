import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as multer from 'multer';

@Injectable()
export class MultereConfig implements MulterOptionsFactory {
  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    };
  }
}
