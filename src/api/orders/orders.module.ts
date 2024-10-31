import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PromoModule } from '../promo/promo.module';

@Module({
  imports: [PromoModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
