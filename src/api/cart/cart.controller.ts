import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { Request } from 'express';
import { CreateCartDto, RemoveCartDto } from './dto/create-cart.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart' })
  @Get()
  get(@Req() req: Request) {
    const user = req['user'] as { sub: string };
    return this.cartService.get(user.sub);
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
  add(@Req() req: Request, @Body() body: CreateCartDto) {
    const user = req['user'] as { sub: string };
    return this.cartService.addItem(user.sub, body);
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
  remove(@Req() req: Request, @Body() body: RemoveCartDto) {
    const user = req['user'] as { sub: string };
    return this.cartService.removeItem(user.sub, body);
  }
}
