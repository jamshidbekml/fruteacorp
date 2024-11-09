import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from 'src/api/prisma/prisma.service';

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
          include: { Product: true },
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
          orderBy: { addedAt: 'desc' },
        },
        id: true,
      },
    });
    return {
      items: cart.products,
      id: cart.id,
    };
  }

  async addItem(cartItemDto: CreateCartDto, userId: string) {
    const product = await this.prismaService.products.findUnique({
      where: { id: cartItemDto.productId },
      select: {
        amount: true,
        discountAmount: true,
        discountExpiresAt: true,
        discountStatus: true,
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

    if (existItem.quantity + cartItemDto.count > product.inStock) {
      throw new BadRequestException('Omborda yetarli emas!');
    }

    const cartId = await this.prismaService.cart
      .findFirst({
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      })
      .then((res) => res.id);
    if (existItem) {
      await this.prismaService.cartProduct.update({
        where: { id: existItem.id },
        data: {
          quantity: { increment: cartItemDto?.count || 1 },
        },
      });

      return await this.prismaService.cart
        .findUnique({
          where: {
            id: cartId,
          },
          select: {
            products: {
              include: { Product: true },
              orderBy: { addedAt: 'desc' },
            },
          },
        })
        .then((res) => ({
          id: cartId,
          items: res.products,
        }));
    }
    await this.prismaService.cartProduct.create({
      data: {
        cartId: cartId,
        productId: cartItemDto.productId,
        quantity: cartItemDto.count || 1,
      },
    });

    return await 'Mahsulot savatga qo`shildi';
  }

  async removeItem(body: { productId: string; count: number }, userId: string) {
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

    return 'Mahsulot savatdan o`chirildi';
  }
}
