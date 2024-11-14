import { Module } from '@nestjs/common';
import { PackmanService } from './packman.service';
import { PackmanController } from './packman.controller';

@Module({
  controllers: [PackmanController],
  providers: [PackmanService],
})
export class PackmanModule {}
