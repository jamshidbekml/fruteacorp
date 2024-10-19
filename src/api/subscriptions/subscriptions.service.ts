import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      return await this.prismaService.subscription.create({
        data: createSubscriptionDto,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findAll() {
    try {
      return await this.prismaService.subscription.findMany();
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.prismaService.subscription.findUnique({
        where: { id },
      });

      if (!data) throw new NotFoundException('Obuna topilmadi!');

      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    try {
      const data = await this.findOne(id);

      return await this.prismaService.subscription.update({
        where: { id: data.id },
        data: updateSubscriptionDto,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async remove(id: string) {
    try {
      const data = await this.findOne(id);

      return await this.prismaService.subscription.delete({
        where: { id: data.id },
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
