import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(userId: string) {
    return await this.prismaService.likedProducts.findMany({
      where: {
        clientId: userId,
      },
      select: {
        product: {
          include: {
            images: {
              where: {
                isMain: true,
              },
              select: {
                image: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    return await this.prismaService.likedProducts.findFirst({
      where: { productId: id, clientId: userId },
    });
  }

  async add(id: string, userId: string) {
    const exist = await this.findOne(id, userId);
    if (exist) {
      await this.prismaService.likedProducts.delete({
        where: {
          id: exist.id,
        },
      });

      return 'Mahsulot muvaffaqiyatli o`chirildi!';
    }

    await this.prismaService.likedProducts.create({
      data: {
        clientId: userId,
        productId: id,
      },
    });

    return 'Mahsulot muvaffaqiyatli qo`shildi!';
  }
}
