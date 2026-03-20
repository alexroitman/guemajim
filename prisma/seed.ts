import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
} as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const communityNames = [
    "Bet-El",
    "Comunidad Sefardí",
    "Or Torah",
    "General",
    "Hebraica",
    "Lamroth",
    "Noé",
    "Lubavitch",
  ];

  const communities = await Promise.all(
    communityNames.map((name) =>
      prisma.community.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log(`✅ ${communities.length} comunidades creadas`);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@guemajim.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const hashed = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashed,
      name: "Administrador",
      dni: "00000000",
      communityId: communities[3].id,
      role: "ADMIN",
      status: "APPROVED",
    },
  });
  console.log(`✅ Admin creado: ${admin.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
