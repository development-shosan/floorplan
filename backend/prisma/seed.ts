
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin1234';
  const saltRounds = 10;

  try {
    // 既存の会社を検索、なければ作成
    let company = await prisma.company.findUnique({
      where: { id: 1 },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          id: 1,
          name: 'Default Company',
          status: true,
          deleted: false,
        },
      });
      console.log(`Created default company: ${company.name}`);
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // 管理者ユーザーをupsert（存在すれば更新、なければ作成）
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: Role.SYSTEM_ADMIN,
        companyId: company.id,
        name: 'Admin User',
        status: true,
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.SYSTEM_ADMIN,
        companyId: company.id,
        name: 'Admin User',
        status: true,
        deleted: false,
      },
    });
    console.log(`Admin user ${adminUser.email} upserted successfully with password: ${adminPassword}`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
