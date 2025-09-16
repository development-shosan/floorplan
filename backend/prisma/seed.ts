import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('1234', 10);

  // 会社の作成 (存在しない場合のみ)
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Inswave',
      status: true,
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      streetAddress: '丸の内1-1',
    },
  });
  console.log(`Created company: ${company.name}`);

  // 管理者ユーザーの作成 (存在しない場合のみ)
  const adminUser = await prisma.user.upsert({
    where: { email: 'shhan@inswave.jp' },
    update: {},
    create: {
      email: 'shhan@inswave.jp',
      name: 'shhan',
      password: hashedPassword,
      companyId: company.id,
      role: Role.SYSTEM_ADMIN,
      status: true,
    },
  });
  console.log(`Created user with email: ${adminUser.email}`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
