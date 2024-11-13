import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { AuthDto, ChangePasswordDto, SignupDto } from './dto/auth.dto';
import { generateRandomNumber } from '../shared/utils/code-generator';
import { smsSender } from '../shared/utils/sms-sender';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async signin(data: AuthDto) {
    const user = await this.userService.findByPhone(data.phone);
    if (!user) throw new BadRequestException('Bunday foydalanuvchi topilmadi!');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Telefon raqam yoki parol notogri!');

    const tokens = await this.getTokens(user.id, user.phone, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken.token);

    return { ...tokens, role: user.role };
  }

  async signup(data: SignupDto) {
    try {
      const user = await this.userService.create(data);

      const tokens = await this.getTokens(user.id, user.phone, user.role);

      return { ...tokens, role: user.role };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, username: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role: role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1y',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role: role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '1y',
        },
      ),
    ]);

    const decodedAccessToken = this.jwtService.decode(accessToken) as {
      exp: number;
    };
    const decodedRefreshToken = this.jwtService.decode(refreshToken) as {
      exp: number;
    };

    return {
      accessToken: {
        token: accessToken,
        expiresIn: new Date(decodedAccessToken.exp * 1000),
      },
      refreshToken: {
        token: refreshToken,
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findByid(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Foydalanuvchi topilmadi!');

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new ForbiddenException('Tokenlar mos emas!');
    const tokens = await this.getTokens(user.id, user.phone, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken.token);
    return tokens;
  }

  async logout(userId: string) {
    await this.userService.update(userId, {
      refreshToken: null,
    });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async getMe(id: string) {
    const user = await this.userService.findByid(id);

    delete user.refreshToken;
    delete user.password;

    return user;
  }

  async sendSmsForChangePassword(phone: string) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const user = await this.prismaService.users.findUnique({
      where: { phone },
      include: {
        otps: {
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            createdAt: {
              gte: twentyFourHoursAgo,
            },
            type: 'web',
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Foydalanuvchi topilmadi!');
    }

    if (user.otps.length > 3)
      throw new BadRequestException(
        `Siz allaqachon 3ta urunishni amalga oshirdingiz! 24 soatdan so'ng qayta urinib ko'ring`,
      );

    const otp = user.otps[0];

    const requiredWaitTime = 2 * 60 * 1000;
    const currentTime = Date.now();

    if (otp && otp.createdAt > new Date(currentTime - requiredWaitTime)) {
      const remainingTime = Math.ceil(
        (requiredWaitTime - (currentTime - otp.createdAt.getTime())) / 1000,
      );

      throw new BadRequestException(
        `Iltimos, ${remainingTime} soniyadan so'ng urinib ko'ring!`,
      );
    }
    const code = generateRandomNumber(5);
    const message = `Frutecorp savdo platformasi foydalanuchining parolini o'zgartirish uchun tasdiqlash kodi: ${code}`;
    const isSent = await smsSender(Number(user.phone).toString(), message);

    if (!isSent)
      throw new BadRequestException(
        `Sms ybiorishda xatolik! Texniklar bilan bog'laning`,
      );

    await this.prismaService.otps.create({
      data: {
        code: code.toString(),
        userId: user.id,
      },
    });

    return `Xabar muvaffaqiyatli yuborildi`;
  }

  async changePassword(data: ChangePasswordDto) {
    const user = await this.prismaService.users.findUnique({
      where: { phone: data.phone },
      include: {
        otps: {
          where: {
            type: 'web',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Foydalanuvchi topilmadi!');
    }

    const otp = user.otps[0];

    if (!otp)
      throw new BadRequestException(
        `Nomalum xatolik yuz berdi! Iltimis texniklar bilan bog'laning!`,
      );

    const requiredWaitTime = 2 * 60 * 1000;
    const currentTime = Date.now();

    if (otp.createdAt < new Date(currentTime - requiredWaitTime))
      throw new BadRequestException(
        `Nomalum xatolik yuz berdi! Iltimos qaytadan urinib ko'ring!`,
      );

    if (otp.code !== data.code)
      throw new BadRequestException('Kod noto`g`ri kiritilgan!');

    const newPassword = await argon2.hash(data.password);

    await this.prismaService.users.update({
      where: {
        id: user.id,
      },
      data: {
        password: newPassword,
      },
    });

    return `Foydalanuvchi paroli muvafaqiyatli o'zgartirildi!`;
  }
}
