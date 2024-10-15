import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(sessionId: string) {
    const wishlist = await this.prismaService.wishlist.findUnique({
      where: {
        sessionId: sessionId,
      },
      include: {
        products: {
          include: {
            Product: {
              select: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      return await this.prismaService.wishlist
        .create({
          data: { sessionId: sessionId },
        })
        .then((res) => {
          return { id: res.id, products: [] };
        });
    }

    return { id: wishlist.id, products: wishlist.products };
  }

  async add(id: string, sessionId: string) {
    const { products: wishlistProducts, id: wishlistId } =
      await this.get(sessionId);

    const exist = wishlistProducts.find((item) => item.productId === id);

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
        wishlistId: wishlistId,
        productId: id,
      },
    });
    return 'Mahsulot muvaffaqiyatli qo`shildi!';
  }

  async mergeWishlist(userId: string, sessionId: string) {
    try {
      const sessionWishlist = await this.prismaService.wishlist.findFirst({
        where: { sessionId },
        include: { products: true },
      });

      const userWishlist = await this.prismaService.wishlist.findFirst({
        where: { userId },
        include: { products: true },
      });

      if (sessionWishlist && userWishlist) {
        await this.prismaService.$transaction(async (prisma) => {
          const newSessionProducts = sessionWishlist.products.filter(
            (sp) =>
              !userWishlist.products.some(
                (up) => up.productId === sp.productId,
              ),
          );

          const combinedProducts = [
            ...userWishlist.products,
            ...newSessionProducts,
          ];

          await prisma.wishlist.delete({
            where: { id: sessionWishlist.id },
          });

          await prisma.wishlist.update({
            where: { id: userWishlist.id },
            data: { products: { set: combinedProducts }, sessionId: sessionId },
          });
        });
      } else if (sessionWishlist) {
        await this.prismaService.wishlist.update({
          where: { id: sessionWishlist.id },
          data: { userId },
        });
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
