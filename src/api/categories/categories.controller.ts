import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'object',
          properties: {
            uz: {
              type: 'string',
              example: 'Test',
            },
            ru: {
              type: 'string',
              example: 'Тест',
            },
          },
          required: ['uz', 'ru'],
        },
      },
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.findAll(+page, +limit, search);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by id' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Update category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'object',
          properties: {
            uz: {
              type: 'string',
              example: 'Test',
            },
            ru: {
              type: 'string',
              example: 'Тест',
            },
          },
          required: ['uz', 'ru'],
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
