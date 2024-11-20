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
        title_en: createCategoryDto.title.en,
        parentId: createCategoryDto.parentId || null,
      },
    });
  }

  async findAll(search?: string) {
    const data = await this.prismaService.categories.findMany({
      where: {
        parentId: null,
        ...(search
          ? {
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
                {
                  title_en: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        childCategories: {
          include: {
            childCategories: {
              include: {
                childCategories: {
                  include: {
                    childCategories: {
                      include: {
                        childCategories: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const total = await this.prismaService.categories.count({
      where: {
        parentId: null,
        ...(search
          ? {
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
                {
                  title_en: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
    });

    return {
      data,
      total,
    };
  }

  async findOne(id: string) {
    const data = await this.prismaService.categories.findUnique({
      where: { id },
      include: {
        childCategories: {
          include: {
            childCategories: {
              include: {
                childCategories: {
                  include: {
                    childCategories: {
                      include: {
                        childCategories: {
                          include: {
                            childCategories: {
                              include: {
                                childCategories: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: {
                      include: {
                        parent: {
                          include: {
                            parent: {
                              include: {
                                parent: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
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
        title_en: updateCategoryDto.title.en,
        parentId: updateCategoryDto.parentId || null,
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const products = await this.prismaService.$queryRaw`
        WITH RECURSIVE CategoryHierarchy AS (
        SELECT id
        FROM categories
        WHERE id = ${id}::uuid  -- Asosiy kategoriya ID (masalan, 1)

        UNION ALL

        -- Barcha bolalar kategoriyalarini qo'shish
        SELECT c.id
        FROM categories c
        INNER JOIN CategoryHierarchy ch ON c."parentId" = ch.id
        )
        SELECT p.*
        FROM products p
        WHERE p."categoryId" IN (SELECT id FROM CategoryHierarchy);
    `;

    if (Array.isArray(products) && products.length > 0)
      throw new NotFoundException("Kategoriyani o'chirish imkoni yo'q!");

    await this.prismaService.categories.delete({
      where: { id: category.id },
    });

    return 'Kategoriya muvaffaqiyatli o`chirildi!';
  }
}
