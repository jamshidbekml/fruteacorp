import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Add or Remove product to wishlist' })
  @Post()
  create(@Req() request, @Body() createWishlistDto: CreateWishlistDto) {
    const sessionId = request.sessionID;
    return this.wishlistService.add(createWishlistDto.productId, sessionId);
  }

  @Get()
  async findAll(@Req() request) {
    const sessionId = request.sessionID;
    const { products } = await this.wishlistService.get(sessionId);

    return products;
  }
}
