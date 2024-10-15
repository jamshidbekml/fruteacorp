import { Controller, Body, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetMe, SignIn, SignUp } from './decorators/auth.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthDto, SignupDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SignIn('signin')
  async create(@Req() request, @Body() createAuthDto: AuthDto) {
    const { tokens, user } = await this.authService.signin(
      createAuthDto,
      request.sessionID,
    );
    request.session.userId = user.id;
    request.session.save();

    return { ...tokens, role: user.role };
  }

  @SignUp('signup')
  async signup(@Req() request, @Body() createAuthDto: SignupDto) {
    const { tokens, user } = await this.authService.signup(
      createAuthDto,
      request.sessionID,
    );

    request.session.userId = user.id;
    request.session.save();

    return { ...tokens, role: user.role };
  }

  @GetMe('getme')
  getMe(@Req() req: Request) {
    const obj = req['user'] as { sub: string };
    return this.authService.getMe(obj.sub);
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBearerAuth()
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req['user']['sub'];
    const refreshToken = req['user']['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
