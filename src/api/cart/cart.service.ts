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
      select: {
        orderItems: true,
        totalAmount: true,
      },
    });

    if (existCart)
      return {
        items: existCart.orderItems,
        totalAmount: existCart.totalAmount,
      };

    const cart = await this.prismaService.orders.create({
      data: {
        userId: userId,
      },
      select: {
        orderItems: true,
        totalAmount: true,
      },
    });

    return { items: cart.orderItems, totalAmount: cart.totalAmount };
  }

  async addItem(userId: string, cartItemDto: CreateCartDto) {
    const cart = await this.get(userId);

    const existItem = cart.items.find(
      (item) => item.productId === cartItemDto.productId,
    );

    const cartId = await this.prismaService.orders
      .findFirst({
        where: {
          userId: userId,
          status: 'created',
        },
        select: {
          id: true,
        },
      })
      .then((res) => res.id);

    if (existItem) {
      await this.prismaService.cartItem.update({
        where: { id: existItem.id },
        data: {
          quantity: existItem.quantity + 1,
        },
      });

      if (existItem.price != cartItemDto.price) {
        await this.prismaService.cartItem.update({
          where: { id: existItem.id },
          data: {
            price: cartItemDto.price,
          },
        });

        return await this.prismaService.orders
          .update({
            where: {
              id: cartId,
            },
            data: {
              totalAmount: Number(cartItemDto.price) * (existItem.quantity + 1),
            },
            select: {
              orderItems: true,
              totalAmount: true,
            },
          })
          .then((res) => ({
            items: res.orderItems,
            totalAmount: res.totalAmount,
          }));
      }

      return await this.prismaService.orders
        .update({
          where: {
            id: cartId,
          },
          data: {
            totalAmount: {
              increment: cartItemDto.price,
            },
          },
          select: {
            orderItems: true,
            totalAmount: true,
          },
        })
        .then((res) => ({
          items: res.orderItems,
          totalAmount: res.totalAmount,
        }));
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

    return await this.prismaService.orders
      .update({
        where: {
          id: cartId,
        },
        data: {
          totalAmount: {
            increment: cartItemDto.price,
          },
        },
        select: {
          orderItems: true,
          totalAmount: true,
        },
      })
      .then((res) => ({
        items: res.orderItems,
        totalAmount: res.totalAmount,
      }));
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.get(userId);

    if (!cart) throw new Error('Savat topilmadi!');

    const existItem = cart.items.find((item) => item.productId === productId);

    if (!existItem) throw new Error('Savatda bu mahsulot mavjud emas!');

    const cartId = await this.prismaService.orders
      .findFirst({
        where: {
          userId: userId,
          status: 'created',
        },
        select: {
          id: true,
        },
      })
      .then((res) => res.id);

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

    return await this.prismaService.orders
      .update({
        where: {
          id: cartId,
        },
        data: {
          totalAmount: {
            decrement: Number(existItem.price),
          },
        },
        select: {
          orderItems: true,
          totalAmount: true,
        },
      })
      .then((res) => ({
        items: res.orderItems,
        totalAmount: res.totalAmount,
      }));
  }
}
