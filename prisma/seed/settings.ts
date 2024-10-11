export default async function settingsSeed(config, prismaClient) {
  try {
    const settings = await prismaClient.settings.findFirst();

    if (!settings) {
      await prismaClient.settings.create({
        data: {
          companyPhone: config.get('COMPANY_PHONE'),
        },
      });

      console.log('Settings seeded successfully'.bgGreen.bold);
    } else {
      console.log('Settings already seeded'.bgYellow.bold);
    }
  } catch (err) {
    console.log(`Error seeding settings: ${err.message}`.bgRed.white);
  }
}
