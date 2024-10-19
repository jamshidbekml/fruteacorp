import { Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../prisma/prisma.service';
import { deleteFile } from '../shared/utils/deleteFile';

@Injectable()
export class BannerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBannerDto: CreateBannerDto, image: string) {
    await this.prismaService.banner.create({
      data: { ...createBannerDto, image },
    });

    return 'Banner muvaffaqiyatli qo`shildi!';
  }

  async findAll() {
    return await this.prismaService.banner.findMany();
  }

  async update(id: string, updateBannerDto: UpdateBannerDto, image?: string) {
    const banner = await this.prismaService.banner.findUnique({
      where: { id },
    });
    if (image) deleteFile('premanent', banner.image);

    return await this.prismaService.banner.update({
      where: { id },
      data: { ...updateBannerDto, image: image || banner.image },
    });
  }

  async remove(id: string) {
    await this.prismaService.banner.delete({ where: { id } });

    return 'Banner muvaffaqiyatli o`chirildi!';
  }
}
