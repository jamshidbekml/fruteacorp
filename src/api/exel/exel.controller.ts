import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExelService } from './exel.service';

@Controller('exel')
export class ExelController {
  constructor(private readonly exelService: ExelService) {}
}
