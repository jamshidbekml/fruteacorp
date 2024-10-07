import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { move } from 'fs-extra';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        const product = await prisma.products.create({
          data: {
            title_ru: createProductDto.title_ru,
            title_uz: createProductDto.title_uz,
            description_ru: createProductDto.description_ru,
            description_uz: createProductDto.description_uz,
            categoryId: createProductDto.categoryId,
            amount: createProductDto?.amount,
            active: createProductDto?.active,
            discountAmount: createProductDto?.discountAmount,
            discountStatus: createProductDto?.discountStatus,
            discountExpiresAt: createProductDto?.discountExpiresAt,
          },
        });

        for await (const image of createProductDto.images) {
          await prisma.productImages.create({
            data: {
              productId: product.id,
              imageId: image.id,
              isMain: image.isMain,
            },
          });

          const imagePath = await prisma.images.findUnique({
            where: { id: image.id },
            select: { name: true },
          });

          const tempPath = join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            'temp',
            imagePath.name,
          );
          const newPath = join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            'permanent',
            imagePath.name,
          );

          await move(tempPath, newPath);
        }
      });

      return 'Mahsulot muvaffaqiyatli yaratildi!';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(page: number, limit: number, search?: string) {
    const data = await this.prismaService.products.findMany({
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
      include: {
        images: {
          where: { isMain: true },
          select: { image: { select: { name: true } } },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.products.count({
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

    return { data, total, pageSize: limit, current: page };
  }

  // findOne(id: string) {
  //   return `This action returns a #${id} product`;
  // }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
