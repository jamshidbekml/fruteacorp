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
import { AuthDto, SignupDto } from './dto/auth.dto';
import { generateRandomNumber } from '../shared/utils/code-generator';
import { smsSender } from '../shared/utils/sms-sender';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signin(data: AuthDto) {
    const user = await this.userService.findByPhone(data.phone);
    if (!user) throw new BadRequestException('Bunday foydalanuvchi topilmadi!');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Parol noto`g`ri kiritilgan!');

    const tokens = await this.getTokens(user.id, user.phone, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken.token);

    return { ...tokens, role: user.role };
  }

  async signup(data: SignupDto) {
    const user = await this.userService.create(data);

    const tokens = await this.getTokens(user.id, user.phone, user.role);

    return { ...tokens, role: user.role };
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
          expiresIn: '12h',
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
          expiresIn: '24h',
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

  async sendOtp(phone: string) {
    const code = generateRandomNumber(5);
    const message = `Frutecorp savdo platformasi foydalanuchining parolini o'zgartirish uchun tasdiqlash kodi: ${code}`;
    const isSent = await smsSender(phone, message);

    if (!isSent)
      throw new BadRequestException(
        `Sms ybiorishda xatolik! Texniklar bilan bog'laning`,
      );
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
}
