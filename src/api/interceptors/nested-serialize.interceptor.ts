import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable, map } from 'rxjs';

interface ClassConstructor {
  new (...args: any[]): object;
}

export function NestedSerialize(dto: ClassConstructor) {
  return UseInterceptors(new NestedSerializeInterceptor(dto));
}

export class NestedSerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        const serialized = plainToClass(this.dto, data.data, {
          excludeExtraneousValues: true,
        });
        return { ...data, data: serialized };
      }),
    );
  }
}
