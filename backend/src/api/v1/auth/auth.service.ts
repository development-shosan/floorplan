// このファイルは、認証に関連するビジネスロジックを担当します。
// 例: ユーザーのログイン処理、トークンの生成など

class AuthService {
    async login(email: string, password: string): Promise<{ token: string }> {
        // 1. データベースからユーザーを検索
        // const user = await prisma.user.findUnique({ where: { email } });

        // 2. ユーザーの存在とパスワードの検証
        // if (!user || !(await bcrypt.compare(password, user.password))) {
        //   throw new ApiError(401, 'Invalid credentials');
        // }

        // 3. JWTを生成
        // const token = generateToken(user.id, user.role, user.companyId);

        // --- ダミーのトークン返却 ---
        const dummyToken = 'dummy-jwt-token-for-' + email;
        return { token: dummyToken };
    }
}

export default new AuthService();
