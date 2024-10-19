import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@ApiBearerAuth()
@ApiTags('Wishlist')
@Controller('wishlist')
@UseInterceptors(TransformInterceptor)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Add or Remove product to wishlist' })
  @Post()
  create(@Req() req: Request, @Body() createWishlistDto: CreateWishlistDto) {
    const { sub } = req['user'] as { sub: string };
    return this.wishlistService.add(createWishlistDto.productId, sub);
  }

  @Get()
  findAll(@Req() req: Request) {
    const { sub } = req['user'] as { sub: string };
    return this.wishlistService.get(sub);
  }
}
