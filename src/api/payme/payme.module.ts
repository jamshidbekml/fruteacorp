import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';

@Module({
  providers: [PaymeService],
  controllers: [PaymeController],
})
export class PaymeModule {}
