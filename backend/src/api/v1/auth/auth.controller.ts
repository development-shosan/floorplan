// このファイルは、HTTPリクエストとレスポンスを直接処理します。
// リクエストからデータを受け取り、サービスクラスに処理を委譲し、結果をクライアントに返します。

import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';

class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            next(error); // エラーハンドリングミドルウェアに処理を渡す
        }
    }
}

export default new AuthController();
