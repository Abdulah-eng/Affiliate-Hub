const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Initial Brands
  const brands = [
    { name: 'WinForLife', loginUrl: 'https://login.winforlife.ph/gateway/v2', status: 'ONLINE' },
    { name: 'BIGWIN', loginUrl: 'https://auth.bigwin-api.io/secure/login', status: 'ONLINE' },
    { name: 'Rollem', loginUrl: 'https://nodes.rollem-vault.com/login', status: 'MAINTENANCE' },
    { name: 'AceBet', loginUrl: 'https://acebet.ph/portal/secure_auth', status: 'ONLINE' },
    { name: 'GoldenSlot', loginUrl: 'https://slot-gate.goldenslot.api/v1', status: 'ONLINE' }
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { name: b.name },
      update: {},
      create: b
    });
  }

  // Create Initial System Settings
  const settings = [
    { key: 'POINTS_REFERRAL', value: '500', description: 'Points per successful referral' },
    { key: 'POINTS_CHAT', value: '10', description: 'Points per quality message' },
    { key: 'POINTS_DAILY', value: '50', description: 'Points for daily login' }
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
