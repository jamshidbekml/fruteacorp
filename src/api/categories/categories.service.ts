import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prismaService.categories.create({
      data: {
        title_ru: createCategoryDto.title.ru,
        title_uz: createCategoryDto.title.uz,
      },
    });
  }

  async findAll(page: number, limit: number, search?: string) {
    const data = await this.prismaService.categories.findMany({
      ...(search
        ? {
            where: {
              OR: [
                {
                  title_ru: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  title_uz: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          }
        : {}),
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.categories.count({
      ...(search
        ? {
            where: {
              OR: [
                {
                  title_ru: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  title_uz: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
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
    const data = await this.prismaService.categories.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!data) throw new NotFoundException('Kategoriya topilmadi!');
    return data;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    return await this.prismaService.categories.update({
      where: { id: category.id },
      data: {
        title_ru: updateCategoryDto.title.ru,
        title_uz: updateCategoryDto.title.uz,
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    if (category.products.length > 0)
      throw new NotFoundException("Kategoriyani o'chirish imkoni yo'q!");

    await this.prismaService.categories.delete({ where: { id: category.id } });
    return 'Kategoriya muvaffaqiyatli o`chirildi!';
  }
}
