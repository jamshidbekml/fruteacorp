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
import { PromoService } from '../promo/promo.service';
import { ConfigService } from '@nestjs/config';
import { MyBot } from 'src/bot/bot';

@Injectable()
export class OrdersService {
  private readonly botService = new MyBot();

  constructor(
    private prismaService: PrismaService,
    private readonly promoService: PromoService,
    private readonly configService: ConfigService,
  ) {}

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

    let amount: number = 0;

    for await (const product of cart.products) {
      const dbProduct = await this.prismaService.products.findUnique({
        where: { id: product.productId },
      });

      if (dbProduct.inStock < product.quantity || dbProduct.active === false) {
        await this.prismaService.cartProduct.delete({
          where: {
            id: product.id,
          },
        });

        throw new BadRequestException(
          `${dbProduct.title_ru} omborda qolmagan!`,
        );
      }

      amount =
        amount +
        (product.Product.discountStatus === 'active'
          ? Number(product.Product.amount) -
            Number(product.Product.discountAmount)
          : Number(product.Product.amount)) *
          product.quantity;
    }

    if (createOrderDto.promoCodeId) {
      const foundPromo = await this.promoService.findOne(
        createOrderDto.promoCodeId,
      );

      await this.promoService.validate(
        { promocode: foundPromo.promocode, amount },
        userId,
      );
    }

    const promo = createOrderDto.promoCodeId
      ? await this.prismaService.promoCodes
          .findUnique({
            where: { id: createOrderDto.promoCodeId },
            select: {
              discount: true,
              promocode: true,
            },
          })
          .then((data) => {
            return {
              discount: (amount * data.discount) / 100,
              promocode: data.promocode,
            };
          })
      : { discount: 0, promocode: null };

    const address = await this.prismaService.userAddress.findUnique({
      where: { id: createOrderDto.addressId },
      include: {
        deliveryArea: true,
      },
    });

    const deliveryPrice = address.deliveryArea.freeDelivery
      ? 0
      : Number(address.deliveryArea.freeDeliveryFrom) <= amount
        ? 0
        : Number(address.deliveryArea.deliveryPrice);

    amount = amount + deliveryPrice;

    return await this.prismaService.$transaction(async (prisma) => {
      const order = await prisma.orders.create({
        data: {
          addressId: createOrderDto.addressId,
          amount,
          discountAmount: promo.discount,
          totalAmount: amount - promo.discount,
          userId,
          deliveryInfo: createOrderDto.deliveryInfo,
          deliveryPrice,
          paymentType: createOrderDto.paymentType,
          promoCode: promo.promocode,
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

        // await prisma.products.update({
        //   where: { id: product.productId },
        //   data: {
        //     inStock: {
        //       decrement: product.quantity,
        //     },
        //     sold: {
        //       increment: product.quantity,
        //     },
        //   },
        // });
      }

      await this.prismaService.cart.delete({
        where: { id: createOrderDto.cartId },
      });

      if (createOrderDto.paymentType === $Enums.PAYMENT_TYPE.payme) {
        return {
          order,
          paymentUrl: generatePaymeUrl(
            order.id,
            (amount - promo.discount) * 100,
          ),
        };
      } else {
        const serviceId = this.configService.get('CLICK_SERVICE_ID');
        const merchantId = this.configService.get('CLICK_MERCHANT_ID');
        return {
          order,
          paymentUrl: `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount - promo.discount}&transaction_param=${order.id}&return_url=https://fruteacorp-shop.vercel.app/user/orders`,
        };
      }
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
        orderNumber: true,
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
        Operator: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        Packman: {
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
      include: {
        items: {
          include: {
            Product: true,
          },
        },
        User: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        Packman: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
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

    if (
      updateOrderDto.status === 'onway' &&
      order.status !== 'onway' &&
      order.operatorStatus !== 'confirmed'
    ) {
      this.botService.sendOrderToPackmans(order.id);
    }

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
