import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';

@Module({
  providers: [PaymeService]
})
export class PaymeModule {}
