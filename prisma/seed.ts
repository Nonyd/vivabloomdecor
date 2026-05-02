import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Vivabloom2025!", 12);

  await prisma.user.upsert({
    where: { email: "admin@vivabloomdecor.com.au" },
    update: {},
    create: {
      email: "admin@vivabloomdecor.com.au",
      name: "Vivabloom Admin",
      password,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✓ Seed complete — admin@vivabloomdecor.com.au / Vivabloom2025!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
