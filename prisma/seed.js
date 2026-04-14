const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Affiliate Hub PH database...");

  // Seed partner brands
  const brands = [
    { name: "BIGWIN", loginUrl: "bigwin-partner.ph/login", status: "ONLINE" },
    { name: "WinForLife", loginUrl: "wfl-agent.com/secure", status: "ONLINE" },
    { name: "Rollem", loginUrl: "rollem-partners.ph", status: "ONLINE" }
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: { loginUrl: brand.loginUrl },
      create: brand
    });
    console.log(`  ✅ Brand '${brand.name}' seeded`);
  }

  // Seed default admin user
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@affiliatehubph.com",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
      kycStatus: "APPROVED",
      referralCode: "admin"
    }
  });
  console.log(`  ✅ Admin user seeded (username: admin, password: Admin@12345)`);

  // Seed default CSR user
  const csrPassword = await bcrypt.hash("Csr@12345", 10);
  await prisma.user.upsert({
    where: { username: "csr_aileen" },
    update: {},
    create: {
      name: "Aileen Santos",
      email: "aileen@affiliatehubph.com",
      username: "csr_aileen",
      password: csrPassword,
      role: "CSR",
      kycStatus: "APPROVED",
      referralCode: "csr_aileen"
    }
  });
  console.log(`  ✅ CSR user seeded (username: csr_aileen, password: Csr@12345)`);

  // Seed a demo approved agent
  const agentPassword = await bcrypt.hash("Agent@12345", 10);
  const agent = await prisma.user.upsert({
    where: { username: "vaultmaster77" },
    update: {},
    create: {
      name: "Juan Dela Cruz",
      email: "juan@vault.ph",
      username: "vaultmaster77",
      password: agentPassword,
      role: "AGENT",
      kycStatus: "APPROVED",
      kycSubmittedAt: new Date(),
      kycReviewedAt: new Date(),
      telegram: "@juan_vault",
      location: "Metro Manila, PH",
      referralCode: "vaultmaster77"
    }
  });
  console.log(`  ✅ Demo agent seeded (username: vaultmaster77, password: Agent@12345)`);

  // Assign approved platform credentials to demo agent
  const bigwinBrand = await prisma.brand.findUnique({ where: { name: "BIGWIN" } });
  const rollemBrand = await prisma.brand.findUnique({ where: { name: "Rollem" } });

  if (bigwinBrand) {
    await prisma.platformAccess.upsert({
      where: { userId_brandId: { userId: agent.id, brandId: bigwinBrand.id } },
      update: {},
      create: {
        userId: agent.id,
        brandId: bigwinBrand.id,
        username: "zenith_bw_01",
        password: "BW_P@ss2024",
        status: "APPROVED"
      }
    });
    console.log(`  ✅ BIGWIN credentials assigned to demo agent`);
  }

  if (rollemBrand) {
    await prisma.platformAccess.upsert({
      where: { userId_brandId: { userId: agent.id, brandId: rollemBrand.id } },
      update: {},
      create: {
        userId: agent.id,
        brandId: rollemBrand.id,
        username: "az_roll_99",
        password: "RL_P@ss2024",
        status: "APPROVED"
      }
    });
    console.log(`  ✅ Rollem credentials assigned to demo agent`);
  }

  // Seed system settings for points
  const settings = [
    { key: "points_per_referral", value: "500", description: "Points awarded when a referred user is approved" },
    { key: "points_per_chat", value: "10", description: "Points awarded per chat message" },
    { key: "points_per_login", value: "50", description: "Points awarded for daily login streak" },
    { key: "points_to_gcash_rate", value: "100", description: "Points needed per 1 PHP GCash" },
    { key: "spin_ticket_cost", value: "1000", description: "Points needed to redeem a spin ticket" },
    { key: "raffle_ticket_cost", value: "5000", description: "Points needed to redeem a raffle ticket" }
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }
  console.log(`  ✅ System settings seeded`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("  Admin:  username=admin        password=Admin@12345");
  console.log("  CSR:    username=csr_aileen   password=Csr@12345");
  console.log("  Agent:  username=vaultmaster77 password=Agent@12345");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
