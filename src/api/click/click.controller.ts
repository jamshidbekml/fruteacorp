import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ClickService } from './click.service';
import { ClickRequestBody } from './types/incoming-request-body';
import { Public } from '../auth/decorators/public.decorator';

@Controller('click')
export class ClickController {
  constructor(private readonly clickService: ClickService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleMerchantTransactions(@Body() clickReqBody: ClickRequestBody) {
    return await this.clickService.handleMerchantTransactions(clickReqBody);
  }
}
