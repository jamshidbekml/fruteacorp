import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAddressDto: CreateAddressDto, userId: string) {
    return await this.prismaService.address.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prismaService.address.findMany({
      where: {
        userId,
      },
    });
  }

  async remove(id: string) {
    await this.prismaService.address.delete({
      where: { id },
    });

    return 'Address muvaffaqiyatli o`chirildi!';
  }
}
