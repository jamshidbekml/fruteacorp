import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(userId: string) {
    const existCart = await this.prismaService.orders.findFirst({
      where: {
        userId: userId,
        status: 'created',
      },
      include: {
        orderItems: true,
      },
    });

    if (existCart) return existCart;

    return await this.prismaService.orders.create({
      data: {
        userId: userId,
      },
      include: {
        orderItems: true,
      },
    });
  }

  async addItem(userId: string, cartId: string, cartItemDto: CreateCartDto) {
    const cart = await this.get(userId);

    const existItem = cart.orderItems.find(
      (item) => item.productId === cartItemDto.productId,
    );

    if (existItem) {
      await this.prismaService.cartItem.update({
        where: { id: existItem.id },
        data: {
          quantity: existItem.quantity + 1,
        },
      });

      if (existItem.price !== cartItemDto.price) {
        await this.prismaService.cartItem.update({
          where: { id: existItem.id },
          data: {
            price: cartItemDto.price,
          },
        });

        return await this.prismaService.orders.update({
          where: {
            id: cartId,
          },
          data: {
            totalAmount: {
              decrement: Number(existItem.price) * existItem.quantity,
              increment: Number(cartItemDto.price) * (existItem.quantity + 1),
            },
          },
        });
      }

      return await this.prismaService.orders.update({
        where: {
          id: cartId,
        },
        data: {
          totalAmount: {
            increment: cartItemDto.price,
          },
        },
      });
    }

    await this.prismaService.cartItem.create({
      data: {
        userId: userId,
        orderId: cartId,
        productId: cartItemDto.productId,
        price: cartItemDto.price,
        quantity: 1,
      },
    });

    return await this.prismaService.orders.update({
      where: {
        id: cartId,
      },
      data: {
        totalAmount: {
          increment: cartItemDto.price,
        },
      },
    });
  }

  async removeItem(userId: string, cartId: string, productId: string) {
    const cart = await this.prismaService.orders.findUnique({
      where: { id: cartId, userId: userId },
      include: { orderItems: true },
    });

    if (!cart) throw new Error('Savat topilmadi!');

    const existItem = cart.orderItems.find(
      (item) => item.productId === productId,
    );

    if (!existItem) throw new Error('Savatda bu mahsulot mavjud emas!');

    if (existItem.quantity > 1) {
      await this.prismaService.cartItem.update({
        where: { id: existItem.id },
        data: {
          quantity: { decrement: 1 },
        },
      });
    } else {
      await this.prismaService.cartItem.delete({
        where: { id: existItem.id },
      });
    }

    return await this.prismaService.orders.update({
      where: {
        id: cartId,
      },
      data: {
        totalAmount: {
          decrement: Number(existItem.price),
        },
      },
    });
  }
}
