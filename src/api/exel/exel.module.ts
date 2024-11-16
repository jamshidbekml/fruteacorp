import { Module } from '@nestjs/common';
import { ExelService } from './exel.service';
import { ExelController } from './exel.controller';

@Module({
  controllers: [ExelController],
  providers: [ExelService],
})
export class ExelModule {}
