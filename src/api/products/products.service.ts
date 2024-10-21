import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { move } from 'fs-extra';
import { deleteFile } from '../shared/utils/deleteFile';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
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
          inStock: createProductDto?.inStock,
          extraInfoUz: createProductDto?.extraInfoUz,
          extraInfoRu: createProductDto?.extraInfoRu,
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
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    categoryId?: string,
  ) {
    const data = await this.prismaService.products.findMany({
      where: {
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
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        images: {
          where: { isMain: true },
          select: { image: { select: { name: true } }, isMain: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.products.count({
      where: {
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
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
      },
    });

    return { data, total, pageSize: limit, current: page };
  }

  async findOne(id: string) {
    const product = await this.prismaService.products.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            image: { select: { name: true, id: true } },
            isMain: true,
          },
        },
      },
    });

    if (!product) throw new BadRequestException('Mahsulot topilmadi!');

    return { ...product, isCart: false };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    const data = await this.prismaService.products.update({
      where: { id: id },
      data: {
        active: updateProductDto?.active || product.active,
        amount: updateProductDto?.amount || product.amount,
        description_ru:
          updateProductDto?.description_ru || product.description_ru,
        description_uz:
          updateProductDto?.description_uz || product.description_uz,
        discountAmount:
          updateProductDto?.discountAmount || product.discountAmount,
        discountExpiresAt:
          updateProductDto?.discountExpiresAt || product.discountExpiresAt,
        discountStatus:
          updateProductDto.discountStatus || product.discountStatus,
        inStock: updateProductDto?.inStock || product.inStock,
        title_ru: updateProductDto?.title_ru || product.title_ru,
        title_uz: updateProductDto?.title_uz || product.title_uz,
        categoryId: updateProductDto?.categoryId || product.categoryId,
        extraInfoRu: updateProductDto?.extraInfoRu || product.extraInfoRu,
        extraInfoUz: updateProductDto?.extraInfoUz || product.extraInfoUz,
      },
    });

    if (updateProductDto.images) {
      const imageIds = updateProductDto.images.map((image) => image.id);

      await this.prismaService.$transaction(async (prisma) => {
        for await (const image of updateProductDto.images) {
          const imageExists = await prisma.productImages.findUnique({
            where: { imageId: image.id },
          });

          if (imageExists) continue;

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

      for await (const dir of product.images) {
        if (!imageIds.includes(dir.image.id)) {
          deleteFile('premanent', dir.image.name);

          await this.prismaService.productImages.delete({
            where: { imageId: dir.image.id },
          });
        }
      }
    }

    return data;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    for await (const dir of product.images) {
      deleteFile('premanent', dir.image.name);
    }

    await this.prismaService.products.delete({ where: { id: product.id } });

    return 'Mahsulot muvaffaqiyatli o`chirildi!';
  }
}
