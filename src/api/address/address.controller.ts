import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@ApiBearerAuth()
@ApiTags('Address')
@Controller('address')
@UseInterceptors(TransformInterceptor)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create address' })
  @ApiBody({ type: CreateAddressDto })
  create(@Req() req: Request, @Body() createAddressDto: CreateAddressDto) {
    const { sub } = req['user'] as { sub: string };

    return this.addressService.create(createAddressDto, sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all address' })
  findAll(@Req() req: Request) {
    const { sub } = req['user'] as { sub: string };

    return this.addressService.findAll(sub);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Delete address' })
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
