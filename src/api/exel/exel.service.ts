import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { utils, writeFile } from 'xlsx';

@Injectable()
export class ExelService {
  constructor(private readonly prismaService: PrismaService) {}
}
