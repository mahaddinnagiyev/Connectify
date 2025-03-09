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

export class MulterFileConfig implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/x-icon',
          'image/svg+xml',

          'audio/mpeg',
          'video/mp4',
          'video/mov',
          'video/avi',
          'video/wmv',
          'video/flv',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              `Invalid file type: ${file.mimetype}. Allowed types: ` +
                'TXT, DOC/DOCX, PDF, PPT/PPTX, XLS/XLSX, ' +
                'JPG, PNG, GIF, WEBP, ICO, SVG, MP3, MP4',
            ),
            false,
          );
        }
      },
    };
  }
}

export class MulterVideoConfig implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(mp4|mov|avi|wmv|flv)$/)) {
          return callback(
            new Error(
              'Invalid file type. Only mp4, mov, avi, wmv, flv are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    };
  }
}

export class MulterImageConfig implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|ico|svg|tiff)$/)) {
          return callback(
            new Error(
              'Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP, ICO, SVG, TIFF are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    };
  }
}

export class MulterAudioConfig implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(mp3|webm|wav|ogg|x-wav)$/)) {
          return callback(
            new Error('Invalid file type. Only MP3 and WEBM are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    };
  }
}
