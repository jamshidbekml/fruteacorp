import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadFile(image: Express.Multer.File, url: string) {
    const imageData = await this.prismaService.images.create({
      data: {
        ext: image.originalname,
        mimetype: image.mimetype,
        name: image.filename,
        size: image.size,
      },
    });

    return {
      id: imageData.id,
      url: url + imageData.name,
      name: imageData.name,
    };
  }
}
