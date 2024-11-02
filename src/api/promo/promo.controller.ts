import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { ValidatePromoDto } from './dto/valitade-promo.dto';
import { Request } from 'express';

@ApiTags('Promo')
@ApiBearerAuth()
@Controller('promo')
@UseInterceptors(TransformInterceptor)
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post()
  @Roles(ROLE.superadmin)
  @ApiBody({ type: CreatePromoDto })
  @ApiOperation({ summary: 'Create promo' })
  create(@Body() createPromoDto: CreatePromoDto) {
    return this.promoService.create(createPromoDto);
  }

  @Get()
  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Get all promos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.promoService.findAll(page, limit, search);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate promo' })
  @ApiBody({ type: ValidatePromoDto })
  validate(@Req() req: Request, @Body() body: ValidatePromoDto) {
    const user = req['user'] as { sub: string };

    return this.promoService.validate(body, user.sub);
  }

  @Get(':id')
  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Get promo by id' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.promoService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLE.superadmin)
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Update promo by id' })
  @ApiBody({ type: UpdatePromoDto })
  update(@Param('id') id: string, @Body() updatePromoDto: UpdatePromoDto) {
    return this.promoService.update(id, updatePromoDto);
  }

  @Delete(':id')
  @Roles(ROLE.superadmin)
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Delete promo by id' })
  remove(@Param('id') id: string) {
    return this.promoService.remove(id);
  }
}
