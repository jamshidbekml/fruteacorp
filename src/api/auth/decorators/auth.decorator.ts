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
          phone: {
            type: 'string',
            example: '+998931487733',
          },
          password: {
            type: 'string',
            example: 'fruteacorp',
          },
        },
        required: ['phone', 'password'],
      },
    }),
    Post(routeName),
  );
}

export function SignUp(routeName: string) {
  return applyDecorators(
    Public(),
    ApiOperation({ summary: 'Sign Up' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          phone: {
            type: 'string',
            example: '+998901234567',
          },
          password: {
            type: 'string',
            example: 'test',
          },
        },
        required: ['phone', 'password'],
      },
    }),
    Post(routeName),
  );
}

export function GetMe(routeName?: string) {
  return applyDecorators(
    // Serialize(GetMeDto),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get Me' }),
    Get(routeName),
  );
}
