import { applyDecorators, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from './public.decorator';
import { GetMeDto } from '../dto/auth.dto';
import { Serialize } from 'src/api/interceptors/serialize.interceptor';

export function SignIn(routeName: string) {
  return applyDecorators(
    Public(),
    ApiOperation({ summary: 'Sign In' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            example: 'test',
          },
          password: {
            type: 'string',
            example: 'test',
          },
        },
        required: ['username', 'password'],
      },
    }),
    Post(routeName),
  );
}

export function GetMe(routeName?: string) {
  return applyDecorators(
    Serialize(GetMeDto),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get Me' }),
    Get(routeName),
  );
}
