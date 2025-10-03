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
            where: { id: 1 }
        });

        if (!company) {
            company = await prisma.company.create({
                data: {
                    id: 1,
                    name: 'Default Company',
                    nameKana: 'デフォルトカンパニー',
                    representative: '代表者名',
                    email: 'info@defaultcompany.com',
                    status: true,
                    postalCode: '100-0001',
                    prefecture: '東京都',
                    city: '千代田区',
                    streetAddress: '千代田1-1-1',
                    deleted: false
                }
            });
            console.log(`Created default company: ${company.name}`);
        }

        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        // id=1のユーザーが存在するかチェック
        const existingAdminUser = await prisma.user.findUnique({
            where: { id: 1 }
        });

        if (existingAdminUser) {
            console.log(
                `User with ID 1 (${existingAdminUser.email}) already exists. Skipping user creation.`
            );
            return; // ユーザー作成をスキップ
        }

        // 管理者ユーザーを作成
        const adminUser = await prisma.user.create({
            data: {
                id: 1, // id=1で作成
                email: adminEmail,
                password: hashedPassword,
                role: Role.SYSTEM_ADMIN,
                companyId: company.id,
                name: 'Admin User',
                status: true,
                deleted: false
            }
        });
        console.log(
            `Admin user ${adminUser.email} (ID: ${adminUser.id}) created successfully with password: ${adminPassword}`
        );
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
