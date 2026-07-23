import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@techfood.com';
  const senha = 'TechFood@2026';

  const existente = await prisma.usuario.findUnique({ where: { email } });

  if (existente) {
    console.log('Usuário admin já existe — seed ignorado.');
    return;
  }

  const senha_hash = await hashPassword(senha);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email,
      senha_hash,
      role: 'admin',
    },
  });

  console.log('Usuário admin criado:');
  console.log(`  E-mail: ${email}`);
  console.log(`  Senha:  ${senha}`);
  console.log('Altere a senha após o primeiro login em produção.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
