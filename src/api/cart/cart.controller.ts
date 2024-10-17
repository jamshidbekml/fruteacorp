import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto, RemoveCartDto } from './dto/create-cart.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart' })
  @Get()
  get(@Req() request) {
    const sessionId = request.cookies.sessionID;
    return this.cartService.get(sessionId);
  }

  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: "Maxsulotnig ID'si UUID",
        },
        count: {
          type: 'number',
          description: 'Mahsulotning soni',
        },
      },
    },
  })
  @Post('add')
  add(@Req() request, @Body() body: CreateCartDto) {
    const sessionId = request.cookies.sessionID;
    return this.cartService.addItem(body, sessionId);
  }

  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: "Maxsulotnig ID'si UUID",
        },
        count: {
          type: 'number',
          description: 'Mahsulotning soni',
        },
      },
    },
  })
  @Post('remove')
  remove(@Req() request, @Body() body: RemoveCartDto) {
    const sessionId = request.cookies.sessionID;
    return this.cartService.removeItem(body, sessionId);
  }
}
