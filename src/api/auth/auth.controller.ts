import {
  Controller,
  Body,
  Req,
  Get,
  UseGuards,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetMe, SignIn, SignUp } from './decorators/auth.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthDto, ChangePasswordDto, SignupDto } from './dto/auth.dto';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@ApiTags('auth')
@UseInterceptors(TransformInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SignIn('signin')
  create(@Body() createAuthDto: AuthDto) {
    return this.authService.signin(createAuthDto);
  }

  @SignUp('signup')
  signup(@Body() createAuthDto: SignupDto) {
    return this.authService.signup(createAuthDto);
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

  @ApiOperation({ summary: 'Send SMS in order to change password' })
  @Public()
  @Post('send-sms')
  sendSms(@Body() body: string) {
    return this.authService.sendSmsForChangePassword(userId);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ type: ChangePasswordDto })
  @Public()
  @Post('change-password')
  changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(userId, body);
  }
}
