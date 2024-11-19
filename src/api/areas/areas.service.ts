import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AreasService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAreaDto: CreateAreaDto) {
    const found = await this.prismaService.areas.findFirst({
      where: {
        OR: [
          {
            areaUZ: createAreaDto.areaUZ,
          },
          {
            areaRU: createAreaDto.areaRU,
          },
          {
            areaEN: createAreaDto.areaEN,
          },
        ],
      },
    });

    if (found) {
      throw new BadRequestException('Area already exists');
    }

    return await this.prismaService.areas.create({ data: createAreaDto });
  }

  async findAll() {
    return await this.prismaService.areas.findMany();
  }

  async findOne(id: string) {
    const data = await this.prismaService.areas.findUnique({
      where: { id },
      include: {
        UserAddress: true,
      },
    });

    if (!data) throw new NotFoundException('Area topilmadi!');

    return data;
  }

  async update(id: string, updateAreaDto: UpdateAreaDto) {
    const area = await this.findOne(id);

    return this.prismaService.areas.update({
      where: { id: area.id },
      data: updateAreaDto,
    });
  }

  async remove(id: string) {
    const area = await this.findOne(id);

    if (area.UserAddress.length > 0)
      throw new NotFoundException(
        'Area o`chirish imkoni yo`q! Uning allaqchon buyurtmalari mavjud',
      );

    await this.prismaService.areas.delete({ where: { id: area.id } });

    return 'Area muvaffaqiyatli o`chirildi!';
  }
}
