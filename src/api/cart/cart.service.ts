import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(userId: string) {
    const existCart = await this.prismaService.cart.findFirst({
      where: {
        userId: userId,
      },
      select: {
        products: {
          include: {
            Product: {
              include: {
                images: {
                  where: { isMain: true },
                  select: {
                    image: { select: { name: true, id: true } },
                  },
                },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
        id: true,
      },
    });

    if (existCart)
      return {
        items: existCart.products,
        id: existCart.id,
      };

    const cart = await this.prismaService.cart.create({
      data: {
        userId: userId,
      },
      select: {
        products: {
          include: { Product: true },
        },
        id: true,
      },
    });

    return {
      items: cart.products,
      id: cart.id,
    };
  }

  async addItem(userId: string, cartItemDto: CreateCartDto) {
    const product = await this.prismaService.products.findUnique({
      where: { id: cartItemDto.productId },
      select: {
        inStock: true,
      },
    });

    if (product.inStock <= 0)
      throw new BadRequestException(
        `Mahsulot sotuvda mavjud emas yoki sotib bo'lindi!`,
      );

    const cart = await this.get(userId);

    const existItem = cart.items.find(
      (item) => item.productId === cartItemDto.productId,
    );

    const { cartId } = await this.prismaService.cart
      .findFirst({
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      })
      .then((res) => ({ cartId: res.id }));

    if (existItem) {
      await this.prismaService.cartProduct.update({
        where: { id: existItem.id },
        data: {
          quantity: { increment: cartItemDto?.count || 1 },
        },
      });

      return 'Mahsulot savatga qo`shildi!';
    }

    await this.prismaService.cartProduct.create({
      data: {
        cartId: cartId,
        productId: cartItemDto.productId,
        quantity: cartItemDto.count || 1,
      },
    });

    return 'Mahsulot savatga qo`shildi!';
  }

  async removeItem(userId: string, body: { productId: string; count: number }) {
    const cart = await this.get(userId);

    if (!cart) throw new Error('Savat topilmadi!');

    const existItem = cart.items.find(
      (item) => item.productId === body.productId,
    );

    if (!existItem) throw new Error('Savatda bu mahsulot mavjud emas!');

    if (existItem.quantity > (body?.count || 1)) {
      await this.prismaService.cartProduct.update({
        where: { id: existItem.id },
        data: {
          quantity: { decrement: body.count || 1 },
        },
      });
    } else {
      await this.prismaService.cartProduct.delete({
        where: { id: existItem.id },
      });
    }

    return 'Mahsulot savatdan o`chirildi!';
  }
}
