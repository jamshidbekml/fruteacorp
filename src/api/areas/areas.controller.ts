import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @ApiOperation({ summary: 'Create Area' })
  @ApiBody({ type: CreateAreaDto })
  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areasService.create(createAreaDto);
  }

  @ApiOperation({ summary: 'Get All Areas' })
  @Get()
  findAll() {
    return this.areasService.findAll();
  }

  @ApiOperation({ summary: 'Get Area By Id' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Area' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateAreaDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areasService.update(id, updateAreaDto);
  }

  @ApiOperation({ summary: 'Delete Area' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areasService.remove(id);
  }
}
