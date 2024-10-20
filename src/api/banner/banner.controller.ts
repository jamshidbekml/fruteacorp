import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Public } from '../auth/decorators/public.decorator';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiTags('Banner')
@Roles(ROLE.superadmin, ROLE.operator)
@UseInterceptors(TransformInterceptor)
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Banner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads/permanent',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${new Date().getTime()}-${uuidv4()}${ext}`;
          return cb(null, filename);
        },
      }),
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        link: {
          type: 'string',
          example: 'https://google.com',
        },
        title: {
          type: 'string',
          example: 'title',
        },
        image: {
          type: 'file',
          format: 'binary',
        },
      },
      required: ['link', 'image'],
    },
  })
  create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) throw new BadRequestException('Rasm yuklanmadi!');

    return this.bannerService.create(createBannerDto, image.filename);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get All Banner' })
  findAll() {
    return this.bannerService.findAll();
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Banner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads/permanent',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${new Date().getTime()}-${uuidv4()}${ext}`;
          return cb(null, filename);
        },
      }),
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        link: {
          type: 'string',
          example: 'https://google.com',
        },
        title: {
          type: 'string',
          example: 'title',
        },
        image: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string' })
  update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.bannerService.update(id, updateBannerDto, image.filename);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Banner' })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
