import { Request, Response, NextFunction } from 'express';

// これはJWTを検証し、ユーザーの役割に基づいてアクセスを制御するミドルウェアの例です。
// 実際のプロジェクトでは、jsonwebtokenライブラリなどを使用します。

export const auth = (...requiredRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. ヘッダーからJWTを取得
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    // 2. JWTを検証 (ここではダミーの検証)
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded; // リクエストオブジェクトにユーザー情報を追加

    // --- ダミーのユーザー情報 ---
    const dummyUser = { id: 1, role: 'COMPANY_ADMIN', companyId: 123 };
    // --- ここまで ---

    // 3. 役割(ロール)ベースのアクセス制御
    if (requiredRoles.length > 0) {
      if (!requiredRoles.includes(dummyUser.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
