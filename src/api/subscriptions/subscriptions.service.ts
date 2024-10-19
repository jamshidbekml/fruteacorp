import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return await this.prismaService.subscription.create({
      data: createSubscriptionDto,
    });
  }

  async findAll() {
    return await this.prismaService.subscription.findMany();
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
}
