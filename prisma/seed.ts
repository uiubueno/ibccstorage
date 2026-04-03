const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Vamos criar a sua senha criptografada (o NextAuth exige isso)
  const hashedDefaultPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "danilo@adegaeneas.com" }, // Seu e-mail de login
    update: {},
    create: {
      name: "Danilo Coelho",
      email: "danilo@adegaeneas.com",
      password: hashedDefaultPassword,
      role: "ADMIN",
      ativo: true,
    },
  });

  console.log("✅ Usuário Mestre Criado:", admin.email);
  console.log("🔑 Senha Padrão: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
