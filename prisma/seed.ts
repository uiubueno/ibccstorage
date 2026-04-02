import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@loja.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@loja.com",
      password: senhaHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin criado:", admin.email);
  console.log("🔑 Senha: admin123");
  console.log("⚠️ TROQUE A SENHA APÓS O PRIMEIRO LOGIN!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());