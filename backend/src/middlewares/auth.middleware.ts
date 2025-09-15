import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from "jsonwebtoken";
import { env } from '../../env';
import type { StringValue } from 'ms';

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


// Token validation and refresh middleware
export const refreshTokenIfValid = (req: Request, res: Response, next:NextFunction )=> {
    const token = req.headers.authorization;
    if (!token) {
        res.status(403).send('Authorization header missing or malformed');
        return
    }

    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in the environment variables.');
        res.status(500).send('Internal Server Error: JWT secret is not configured.');
        return;
    }

    jwt.verify(token, jwtSecret, (err: VerifyErrors | null) => {
        if (err) {
            res.status(403).send('Invalid or expired token');
            return
        }

        const newToken = jwt.sign({}, jwtSecret, { expiresIn: env.TOKEN_EXPIRES as StringValue });
        res.setHeader('Authorization', newToken);
        return next();
    });
}