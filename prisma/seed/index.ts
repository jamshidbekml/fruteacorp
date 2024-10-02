import { PrismaClient } from '@prisma/client';
import 'colors';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

async function seed() {
  try {
    const config = new ConfigService();
    const prismaClient = new PrismaClient();
    const exists = await prismaClient.users.findUnique({
      where: { phone: config.get('ADMIN_PHONE') },
    });
    if (!exists) {
      const hash = await argon2.hash(config.get('ADMIN_PASSWORD'));
      await prismaClient.users.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          password: hash,
          role: 'superadmin',
          phone: config.get('ADMIN_PHONE'),
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
