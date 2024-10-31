import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAddressDto: CreateAddressDto, userId: string) {
    return await this.prismaService.userAddress.create({
      data: {
        userId,
        deliveryAreaId: createAddressDto.deliveryAreaId,
        lat: createAddressDto.lat,
        long: createAddressDto.long,
        streetName: createAddressDto.streetName,
        houseEntryCode: createAddressDto?.houseEntryCode,
        houseNumber: createAddressDto?.houseNumber,
        houseLine: createAddressDto?.houseLine,
        houseStage: createAddressDto?.houseStage,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prismaService.userAddress.findMany({
      where: {
        userId,
      },
    });
  }

  async remove(id: string) {
    await this.prismaService.userAddress.delete({
      where: { id },
    });

    return 'Address muvaffaqiyatli o`chirildi!';
  }
}
