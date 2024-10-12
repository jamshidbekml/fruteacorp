import { BadRequestException, Injectable } from '@nestjs/common';
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
        orderItems: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
        totalAmount: true,
        id: true,
      },
    });

    if (existCart)
      return {
        items: existCart.orderItems,
        totalAmount: existCart.totalAmount,
        id: existCart.id,
      };

    const cart = await this.prismaService.orders.create({
      data: {
        userId: userId,
      },
      select: {
        orderItems: {
          include: { product: true },
        },
        totalAmount: true,
        id: true,
      },
    });

    return {
      items: cart.orderItems,
      totalAmount: cart.totalAmount,
      id: cart.id,
    };
  }

  async addItem(userId: string, cartItemDto: CreateCartDto) {
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

    const { cartId, totalAmount } = await this.prismaService.orders
      .findFirst({
        where: {
          userId: userId,
          status: 'created',
        },
        select: {
          id: true,
          totalAmount: true,
        },
      })
      .then((res) => ({ cartId: res.id, totalAmount: res.totalAmount }));

    if (existItem) {
      const discount =
        existItem.product.discountStatus === 'active' &&
        existItem.product.discountExpiresAt > new Date();
      const price = discount
        ? Number(existItem.product.amount) -
          Number(existItem.product.discountAmount)
        : Number(existItem.product.amount);

      await this.prismaService.cartItem.update({
        where: { id: existItem.id },
        data: {
          price,
          quantity: { increment: cartItemDto?.count || 1 },
        },
      });

      const decrement = Number(existItem.price) * existItem.quantity;
      const increment = price * (existItem.quantity + (cartItemDto.count || 1));
      return await this.prismaService.orders
        .update({
          where: {
            id: cartId,
          },
          data: {
            totalAmount: Number(totalAmount) + increment - decrement,
          },
          select: {
            orderItems: { include: { product: true } },
            totalAmount: true,
          },
        })
        .then((res) => ({
          items: res.orderItems,
          totalAmount: res.totalAmount,
        }));
    }

    const discount =
      product.discountStatus === 'active' &&
      product.discountExpiresAt > new Date();
    const price = discount
      ? Number(product.amount) - Number(product.discountAmount)
      : Number(product.amount);

    await this.prismaService.cartItem.create({
      data: {
        userId: userId,
        orderId: cartId,
        productId: cartItemDto.productId,
        price: price,
        quantity: cartItemDto.count || 1,
      },
    });

    return await this.prismaService.orders
      .update({
        where: {
          id: cartId,
        },
        data: {
          totalAmount: {
            increment: price * (cartItemDto.count || 1),
          },
        },
        select: {
          orderItems: {
            include: { product: true },
          },
          totalAmount: true,
        },
      })
      .then((res) => ({
        items: res.orderItems,
        totalAmount: res.totalAmount,
      }));
  }

  async removeItem(userId: string, body: { productId: string; count: number }) {
    const cart = await this.get(userId);

    if (!cart) throw new Error('Savat topilmadi!');

    const existItem = cart.items.find(
      (item) => item.productId === body.productId,
    );

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

    if (existItem.quantity > (body?.count || 1)) {
      await this.prismaService.cartItem.update({
        where: { id: existItem.id },
        data: {
          quantity: { decrement: body.count || 1 },
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
            decrement:
              Number(existItem.price) *
              (existItem.quantity >= body.count || 1
                ? body.count || 1
                : existItem.quantity),
          },
        },
        select: {
          orderItems: { include: { product: true } },
          totalAmount: true,
        },
      })
      .then((res) => ({
        items: res.orderItems,
        totalAmount: res.totalAmount,
      }));
  }
}
