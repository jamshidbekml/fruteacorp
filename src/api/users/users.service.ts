import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { ROLE } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const isExist = await this.prismaService.users.findFirst({
      where: {
        OR: [{ phone: createUserDto.phone }],
      },
    });

    if (isExist)
      throw new BadRequestException(
        `Bunday raqamli foydalanuvchi allaqachon mavjud!`,
      );

    createUserDto.password = await argon2.hash(createUserDto.password);
    createUserDto.phone = Number(createUserDto.phone).toString();

    return await this.prismaService.users.create({ data: createUserDto });
  }

  async findByPhone(phone: string) {
    return await this.prismaService.users.findUnique({
      where: { phone: Number(phone).toString() },
    });
  }

  async findByid(id: string) {
    const user = await this.prismaService.users.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            items: {
              select: {
                productId: true,
                amount: true,
                quantity: true,
                title_uz: true,
                title_ru: true,
                Product: {
                  select: {
                    images: {
                      where: { isMain: true },
                      select: {
                        image: { select: { name: true } },
                      },
                    },
                    Reviews: {
                      select: {
                        id: true,
                        comment: true,
                        rate: true,
                        replies: true,
                        createdAt: true,
                      },
                      where: {
                        userId: id,
                      },
                    },
                  },
                },
              },
            },
            Address: {
              select: {
                deliveryArea: {
                  select: {
                    areaRU: true,
                    areaUZ: true,
                  },
                },
                streetName: true,
                houseNumber: true,
                houseEntryCode: true,
                houseLine: true,
                houseStage: true,
              },
            },
            createdAt: true,
            deliveryInfo: true,
            type: true,
            status: true,
            amount: true,
            discountAmount: true,
            totalAmount: true,
            id: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
        addresses: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi!');

    return user;
  }

  async findAll(page: number, limit: number, search?: string) {
    const users = await this.prismaService.users.findMany({
      ...(search
        ? {
            where: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await this.prismaService.users.count({
      ...(search
        ? {
            where: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    });

    return {
      data: users,
      pageSize: limit,
      current: page,
      total,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    role?: ROLE,
    sub?: string,
  ) {
    const user = await this.findByid(id);

    if (updateUserDto?.role && ROLE.superadmin !== role)
      throw new BadRequestException('Access denied!');

    if (sub === id && updateUserDto.role)
      throw new BadRequestException('Access denied!');

    delete updateUserDto?.phone;
    return await this.prismaService.users.update({
      where: { id: user.id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.findByid(id);

    await this.prismaService.users.delete({ where: { id: user.id } });

    return 'Foydalanuvchi muvaffaqiyatli o`chirildi!';
  }
}
