import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async updateSession(sessionId: string, req: Request, userId?: string) {
    const userAgent = req.headers['user-agent'] || 'Unknown'; // Brauzer yoki qurilma ma'lumotlari
    const ipAddress = req.ip; // Foydalanuvchi IP manzili
    const deviceType = this.getDeviceType(req); // Qurilma turi (desktop yoki mobile)

    return this.prisma.session.update({
      where: { sid: sessionId },
      data: {
        userAgent,
        ipAddress,
        deviceType,
        userId,
      },
    });
  }

  async getSession(sessionId: string) {
    return await this.prisma.session.findUnique({
      where: { sid: sessionId },
    });
  }

  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        deviceType: true,
        ipAddress: true,
        userAgent: true,
        sid: true,
        userId: true,
        createdAt: true,
      },
    });
  }

  async deleteSession(sessionId: string) {
    return this.prisma.session.delete({
      where: { sid: sessionId },
    });
  }

  getDeviceType(req: Request): string {
    const userAgent = req.headers['user-agent'] || '';
    if (/mobile/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }
}
