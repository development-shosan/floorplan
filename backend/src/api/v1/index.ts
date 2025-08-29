// このファイルは、v1の全てのルーターをまとめてエクスポートします。

import { Router } from 'express';
import authRoutes from './auth/auth.route';
// import teamRoutes from './team/team.route'; // 将来的に追加

const router = Router();

router.use('/auth', authRoutes);
// router.use('/team', teamRoutes);

export default router;
