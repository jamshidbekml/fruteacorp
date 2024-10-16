import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPromoDto: CreatePromoDto) {
    try {
      createPromoDto.promocode = createPromoDto.promocode.toUpperCase();
      const isExist = await this.prismaService.promoCodes.findUnique({
        where: { promocode: createPromoDto.promocode },
      });

      if (isExist) throw new BadRequestException('Bunday promokod mavjud!');

      await this.prismaService.promoCodes.create({ data: createPromoDto });

      return 'Promokod muvaffaqqiyatli yaratildi!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findAll(page: number, limit: number, search?: string) {
    const data = await this.prismaService.promoCodes.findMany({
      ...(search
        ? {
            where: {
              OR: [
                { title: { mode: 'insensitive', contains: search } },
                { promocode: { mode: 'insensitive', contains: search } },
              ],
            },
          }
        : {}),
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.promoCodes.count({
      ...(search
        ? {
            where: {
              OR: [
                { title: { mode: 'insensitive', contains: search } },
                { promocode: { mode: 'insensitive', contains: search } },
              ],
            },
          }
        : {}),
    });

    return {
      data,
      pageSize: limit,
      current: page,
      total,
    };
  }

  async findOne(id: string) {
    const data = await this.prismaService.promoCodes.findUnique({
      where: { id },
    });

    if (!data) throw new NotFoundException('Promokod topilmadi!');

    return data;
  }

  async update(id: string, updatePromoDto: UpdatePromoDto) {
    const promo = await this.findOne(id);

    await this.prismaService.promoCodes.update({
      where: { id: promo.id },
      data: updatePromoDto,
    });

    return 'Promokod muvaffaqiyatli o`zgartirildi!';
  }

  async remove(id: string) {
    const promo = await this.findOne(id);

    await this.prismaService.promoCodes.delete({ where: { id: promo.id } });

    return 'Promokod muvaffaqiyatli o`chirildi!';
  }
}
