import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { promises as fs } from 'fs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_WEEKEND)
  async tokenUpdater() {
    try {
      const {
        data: {
          data: { token },
        },
      } = await axios.patch(
        'https://notify.eskiz.uz/api/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('ESKIZ_TOKEN')}`,
          },
        },
      );
      const envFilePath = join(__dirname, '..', '..', '..', '..', '.env');

      let data = await fs.readFile(envFilePath, 'utf8');

      data = data
        .split('\n')
        .map((line) => {
          if (line.startsWith(`ESKIZ_TOKEN=`)) {
            return `ESKIZ_TOKEN=${token}`;
          }
          return line;
        })
        .join('\n');

      await fs.writeFile(envFilePath, data);
    } catch (err) {
      console.log(err.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOrders() {
    await this.prismaService.promoCodes.updateMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
      data: {
        active: false,
      },
    });

    await this.prismaService.products.updateMany({
      where: {
        discountExpiresAt: {
          lte: new Date(),
        },
      },
      data: {
        discountStatus: 'inactive',
      },
    });

    await this.prismaService.orders.deleteMany({
      where: {
        createdAt: {
          lte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
        status: 'created',
      },
    });
  }

  onModuleInit() {
    this.tokenUpdater();
  }
}
