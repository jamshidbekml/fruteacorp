import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeRequestBody } from './types/incoming-request-body';
import { PaymeBasicAuthGuard } from '../auth/guards/payme.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payme')
export class PaymeController {
  constructor(private readonly paymeService: PaymeService) {}

  @Post()
  @Public()
  @UseGuards(PaymeBasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleTransactionMethods(reqBody: PaymeRequestBody) {
    return await this.paymeService.handleTransactionMethods(reqBody);
  }
}
