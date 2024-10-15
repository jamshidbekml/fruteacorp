import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(sessionId: string) {
    const existCart = await this.prismaService.cart.findFirst({
      where: {
        sessionId: sessionId,
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
        sessionId: sessionId,
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

  async addItem(cartItemDto: CreateCartDto, sessionId: string) {
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
    const cart = await this.get(sessionId);
    const existItem = cart.items.find(
      (item) => item.productId === cartItemDto.productId,
    );
    const cartId = await this.prismaService.cart
      .findFirst({
        where: {
          sessionId: sessionId,
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

  async removeItem(
    body: { productId: string; count: number },
    sessionId: string,
  ) {
    const cart = await this.get(sessionId);

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

  async mergeCarts(userId: string, sessionId: string) {
    try {
      const sessionCart = await this.prismaService.cart.findFirst({
        where: { sessionId },
        include: { products: true },
      });

      const userCart = await this.prismaService.cart.findFirst({
        where: { userId },
        include: { products: true },
      });

      if (sessionCart && userCart) {
        await this.prismaService.$transaction(async (prisma) => {
          const updatedProducts = userCart.products.map((up) => {
            const sessionProduct = sessionCart.products.find(
              (sp) => sp.productId === up.productId,
            );

            if (sessionProduct) {
              return {
                ...up,
                quantity: up.quantity + sessionProduct.quantity,
              };
            }

            return up;
          });

          const newSessionProducts = sessionCart.products.filter(
            (sp) =>
              !userCart.products.some((up) => up.productId === sp.productId),
          );

          const combinedProducts = [...updatedProducts, ...newSessionProducts];

          await prisma.cart.delete({
            where: { id: sessionCart.id },
          });

          await prisma.cart.update({
            where: { id: userCart.id },
            data: { products: { set: combinedProducts }, sessionId: sessionId },
          });
        });
      } else if (sessionCart) {
        await this.prismaService.cart.update({
          where: { id: sessionCart.id },
          data: { userId },
        });
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
