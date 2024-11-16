import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExelService } from './exel.service';
import { CreateExelDto } from './dto/create-exel.dto';
import { UpdateExelDto } from './dto/update-exel.dto';

@Controller('exel')
export class ExelController {
  constructor(private readonly exelService: ExelService) {}

  @Post()
  create(@Body() createExelDto: CreateExelDto) {
    return this.exelService.create(createExelDto);
  }

  @Get()
  findAll() {
    return this.exelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExelDto: UpdateExelDto) {
    return this.exelService.update(+id, updateExelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exelService.remove(+id);
  }
}
