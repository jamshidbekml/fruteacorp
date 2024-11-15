import { Controller, Get } from '@nestjs/common';
import { Public } from './api/auth/decorators/public.decorator';
import axios from 'axios';

@Controller('app')
export class AppController {

  @Public()
  @Get()
  get() {
    axios.post('http://localhost:6262/operator/' + '855d5d5b-2a20-4205-922a-2e67cb7f09a5');
  }
}
