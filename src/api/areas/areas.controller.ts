import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Areas')
@UseInterceptors(TransformInterceptor)
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Roles(ROLE.superadmin)
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

  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Update Area' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateAreaDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areasService.update(id, updateAreaDto);
  }

  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Delete Area' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areasService.remove(id);
  }
}
