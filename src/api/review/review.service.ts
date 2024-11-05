import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto, ReplyDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReviewDto: CreateReviewDto,
    orderId: string,
    userId: string,
  ) {
    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) throw new BadRequestException('Buyurtma topilmadi!');

    if (order.userId !== userId)
      throw new BadRequestException('Bu buyurtma sizga tegishli emas!');

    if (!order.items.some((e) => e.productId === createReviewDto.productId)) {
      throw new BadRequestException('Mahsulot buyurtma ichida mavjud emas!');
    }

    const product = await this.prismaService.products.findUnique({
      where: { id: createReviewDto.productId },
    });

    if (!product) throw new BadRequestException('Mahsulot topilmadi!');

    await this.prismaService.review.create({
      data: {
        rate: createReviewDto.rate,
        comment: createReviewDto.comment,
        productId: createReviewDto.productId,
        userId: userId,
        orderId: orderId,
      },
    });

    return 'Sharx muvaffaqiyatli qabul qilindi!';
  }

  async replyToReview(id: string, { message }: ReplyDto) {
    const review = await this.findOne(id);

    if (review.replies)
      throw new BadRequestException('Sharx allaqachon javob berildi!');

    await this.prismaService.replies.create({
      data: {
        message,
        reviewId: review.id,
      },
    });

    return 'Sharx muvaffaqiyatli qabul qilindi!';
  }

  async findAll(page: number, limit: number) {
    const data = await this.prismaService.review.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.review.count();

    return {
      data,
      pageSize: limit,
      current: page,
      total,
    };
  }

  async findOne(id: string) {
    const review = await this.prismaService.review.findUnique({
      where: { id },
      include: { replies: true },
    });

    if (!review) throw new BadRequestException('Sharx topilmadi!');

    return review;
  }

  async remove(id: string) {
    const review = await this.findOne(id);

    await this.prismaService.review.delete({ where: { id: review.id } });

    return 'Sharx muvaffaqiyatli o`chirildi!';
  }
}
