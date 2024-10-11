import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload Image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads/temp',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${new Date().getTime()}-${file.originalname}-${ext}`;
          return cb(null, filename);
        },
      }),
    }),
  )
  @Post('image')
  uploadFile(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
    return this.uploadService.uploadFile(
      image,
      `${req.protocol}://${req.get('host')}/temp/images/`,
    );
  }
}
