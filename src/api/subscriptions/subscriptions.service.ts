import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { generatePaymeUrl } from '../shared/utils/payme-url-generator';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return await this.prismaService.subscription.create({
      data: createSubscriptionDto,
    });
  }

  async findAll() {
    return await this.prismaService.subscription.findMany({
      orderBy: { duration: 'asc' },
    });
  }

  async findOne(id: string) {
    const data = await this.prismaService.subscription.findUnique({
      where: { id },
    });

    if (!data) throw new NotFoundException('Obuna topilmadi!');

    return data;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const data = await this.findOne(id);

    return await this.prismaService.subscription.update({
      where: { id: data.id },
      data: updateSubscriptionDto,
    });
  }

  async remove(id: string) {
    const data = await this.findOne(id);

    return await this.prismaService.subscription.delete({
      where: { id: data.id },
    });
  }

  async purchase(id: string, userId: string) {
    const subscription = await this.findOne(id);

    const order = await this.prismaService.orders.create({
      data: {
        userId,
        totalAmount: subscription.price,
        discountAmount: 0,
        amount: subscription.price,
        type: 'subscription',
        subscriptionId: subscription.id,
      },
    });

    return {
      order,
      paymeUrl: generatePaymeUrl(order.id, Number(order.amount) * 100),
    };
  }
}
