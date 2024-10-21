import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { generatePaymeUrl } from '../shared/utils/payme-url-generator';
import { $Enums } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const cart = await this.prismaService.cart.findUnique({
      where: {
        id: createOrderDto.cartId,
      },
      include: {
        products: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!cart || cart.products.length === 0)
      throw new BadRequestException("Savat topilmadi yoki bo'sh");

    const promo = createOrderDto.promoCodeId
      ? await this.prismaService.promoCodes.findUnique({
          where: { id: createOrderDto.promoCodeId },
          select: {
            discount: true,
          },
        })
      : { discount: 0 };

    return await this.prismaService.$transaction(async (prisma) => {
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          active: true,
        },
        include: {
          Subscription: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      let amount: number = 0;

      for (const product of cart.products) {
        amount =
          amount +
          (product.Product.discountStatus === 'active'
            ? Number(product.Product.amount) -
              Number(product.Product.discountAmount)
            : Number(product.Product.amount)) *
            product.quantity;
      }

      const discount = subscription
        ? (subscription.Subscription.discount * amount) / 100 - promo.discount
        : promo.discount;

      const order = await prisma.orders.create({
        data: {
          addressId: createOrderDto.addressId,
          amount,
          discountAmount: discount,
          totalAmount: amount - discount,
          userId,
          deliveryInfo: createOrderDto.deliveryInfo,
        },
      });

      for await (const product of cart.products) {
        await prisma.orderProduct.create({
          data: {
            orderId: order.id,
            productId: product.productId,
            quantity: product.quantity,
            title_ru: product.Product.title_ru,
            title_uz: product.Product.title_uz,
            amount:
              product.Product.discountStatus === 'active'
                ? Number(product.Product.amount) -
                  Number(product.Product.discountAmount)
                : Number(product.Product.amount),
          },
        });

        await prisma.products.update({
          where: { id: product.productId },
          data: {
            inStock: {
              decrement: product.quantity,
            },
            sold: {
              increment: product.quantity,
            },
          },
        });
      }

      return {
        order,
        paymeUrl: generatePaymeUrl(order.id, (amount - discount) * 100),
      };
    });
  }

  async findAll(
    page: number,
    limit: number,
    status: $Enums.ORDER_STATUS,
    search?: string,
  ) {
    const data = await this.prismaService.orders.findMany({
      where: {
        status: status,
        ...(search
          ? {
              OR: [
                { User: { phone: { contains: search, mode: 'insensitive' } } },
                {
                  User: {
                    firstName: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  User: { lastName: { contains: search, mode: 'insensitive' } },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        Address: {
          select: {
            streetName: true,
          },
        },
        totalAmount: true,
        type: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.orders.count({
      where: {
        status: status,
        ...(search
          ? {
              OR: [
                { User: { phone: { contains: search, mode: 'insensitive' } } },
                {
                  User: {
                    firstName: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  User: { lastName: { contains: search, mode: 'insensitive' } },
                },
              ],
            }
          : {}),
      },
    });

    return {
      data,
      pageSize: limit,
      current: page,
      total,
    };
  }

  async findOne(id: string) {
    const order = await this.prismaService.orders.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi!');

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    await this.prismaService.orders.update({
      where: { id: order.id },
      data: updateOrderDto,
    });

    return 'Buyurtma muvaffaqiyatli o`zgartirildi!';
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    await this.prismaService.orders.delete({
      where: { id: order.id },
    });

    return 'Buyurtma muvaffaqiyatli o`chirildi!';
  }
}
