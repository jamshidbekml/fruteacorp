import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { Request } from 'express';
import { CreateCartDto, RemoveCartDto } from './dto/create-cart.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
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
        price: {
          type: 'number',
          description: 'Maxsulotning narxi',
        },
      },
    },
  })
  @Post('add/:id')
  add(
    @Req() req: Request,
    @Param('cartId') cartId: string,
    @Body() body: CreateCartDto,
  ) {
    const user = req['user'] as { sub: string };
    return this.cartService.addItem(user.sub, cartId, body);
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
      },
    },
  })
  @Post('remove/:id')
  remove(
    @Req() req: Request,
    @Param('cartId') cartId: string,
    @Body() body: RemoveCartDto,
  ) {
    const user = req['user'] as { sub: string };
    return this.cartService.removeItem(user.sub, cartId, body.productId);
  }
}
