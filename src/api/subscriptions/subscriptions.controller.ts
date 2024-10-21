import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseInterceptors(TransformInterceptor)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Create Subscription' })
  @ApiBearerAuth()
  @ApiBody({
    type: CreateSubscriptionDto,
  })
  @Post()
  @Roles(ROLE.superadmin)
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Public()
  @ApiOperation({ summary: 'Get All Subscriptions' })
  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Get Subscription' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase Subscription' })
  @ApiParam({ name: 'id', type: String })
  @Post('purchase/:id')
  purchase(@Req() req: Request, @Param('id') id: string) {
    const user = req['user'] as { sub: string };
    return this.subscriptionsService.purchase(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Subscription' })
  @ApiParam({ name: 'id', type: String })
  @Roles(ROLE.superadmin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @ApiBearerAuth()
  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Delete Subscription' })
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
