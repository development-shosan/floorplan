// このファイルは、認証関連のエンドポイント（URL）と、それに対応するコントローラーのアクションをマッピングします。

import { Router } from 'express';
import authController from './auth.controller';

const router = Router();

router.post('/login', authController.login);

export default router;
