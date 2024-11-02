import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { Request } from 'express';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiTags('Review')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Create Review' })
  @ApiBody({ type: CreateReviewDto })
  @Post(':orderId')
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ) {
    const { sub } = req['user'] as { sub: string };
    return this.reviewService.create(createReviewDto, orderId, sub);
  }

  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Get All Review' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.reviewService.findAll(page, limit);
  }

  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Delete Review' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
