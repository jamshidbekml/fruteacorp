import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(userId: string) {
    return await this.prismaService.wishlist.findMany({
      where: {
        userId: userId,
      },
      select: {
        products: {
          include: {
            Product: {
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
        },
      },
    });
  }

  async findOne(id: string, wishlistId: string) {
    return await this.prismaService.wishlistProduct.findFirst({
      where: { productId: id, wishlistId: wishlistId },
    });
  }

  async add(id: string, userId: string) {
    const wishlist = await this.prismaService.wishlist
      .findUnique({
        where: {
          userId: userId,
        },
      })
      .then(async (data) => {
        if (!data) {
          return await this.prismaService.wishlist.create({ data: { userId } });
        }
        return data;
      });

    const exist = await this.findOne(id, wishlist.id);

    if (exist) {
      await this.prismaService.wishlistProduct.delete({
        where: {
          id: exist.id,
        },
      });

      return 'Mahsulot muvaffaqiyatli o`chirildi!';
    }

    await this.prismaService.wishlistProduct.create({
      data: {
        wishlistId: wishlist.id,
        productId: id,
      },
    });

    return 'Mahsulot muvaffaqiyatli qo`shildi!';
  }
}
