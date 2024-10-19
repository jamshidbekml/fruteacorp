import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
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
  @ApiOperation({ summary: 'Update Subscription' })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Subscription' })
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
