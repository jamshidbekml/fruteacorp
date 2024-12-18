import { PrismaClient } from '@prisma/client';
import 'colors';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import settingsSeed from './settings';

async function seed() {
  try {
    const config = new ConfigService();
    const prismaClient = new PrismaClient();
    await settingsSeed(config, prismaClient);
    const exists = await prismaClient.users.findUnique({
      where: { phone: Number(config.get('ADMIN_PHONE')).toString() },
    });
    if (!exists) {
      const hash = await argon2.hash(config.get('ADMIN_PASSWORD'));
      await prismaClient.users.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          password: hash,
          role: 'superadmin',
          phone: Number(config.get('ADMIN_PHONE')).toString(),
        },
      });
      console.log('Data seeded successfully'.bgGreen.bold);
      return;
    }
    console.log('Data already seeded'.bgYellow.bold);
  } catch (err) {
    console.log(`Error seeding data: ${err}`.bgYellow.bold);
  }
}

seed();
