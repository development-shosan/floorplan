/*
   src/app.ts
*/
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import DSMgr from './DSMgr';
import {UserModificationError, LoginError} from './ApplicationErrors';
import morgan from 'morgan';
import cors from 'cors';
import { body, param } from 'express-validator';
import {refreshTokenIfValid, authorizeRoles} from "./middlewares/auth.middleware";
import {validatorErrorChecker} from './middlewares/validator.middleware';
import {AuthTokenPayload} from './types/LoginParam';
import {env} from '../env';
import { Role } from "@prisma/client";


const app = express();
const router = express.Router();
const PORT = env.WEB_SERVER_PORT;
const dsMgr = new DSMgr();

// cross-origin resource sharing
app.use(cors({
    origin: true
}));
// JSONボディパーサーを有効にする
app.use(express.json());
// HTTP log output
app.use(morgan('dev'));
// prefix URI
app.use('/api/v1', router);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).send('Backend is healthy!');
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

/**
 *  Login authentication.
 *      Request param:
 *          curl -i -X POST -H "Content-Type: application/json"
 *               -d "{\"email\":\"user@example.com\",\"password\":\"1234\"}" http://localhost:4000/api/v1/login
 *
 *      Response: Object<LoginResult>
 */
router.post('/login',
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isString(),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const result = await dsMgr.login(req.body.email, req.body.password);
            res.json(result);

        } catch (err) {
            if (err instanceof LoginError) {
                res.sendStatus(401);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
});

/**
 *  Retrieves a list of users.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN" http://localhost:4000/api/v1/members
 *
 *      Response: Object<UserInfoOutput>
 */
router.get('/members',
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const authPayload: AuthTokenPayload | undefined = req.user
            if(!authPayload){
                res.status(403).send('No payload found in token');
                return
            }

            const result = await dsMgr.getUsers(authPayload);
            res.json(result);

        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
});

/**
 *  Creates a new user.
 *      Request param:
 *          curl -i -X POST -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\":\"渡辺\", \"companyId\":2, \"email\":\"user2@example.com\",
 *          \"password\":\"1234\", \"role\":\"MEMBER\", \"department\":\"営業\",
 *          \"phoneNumber\":\"090-1111-2222\"}" http://localhost:4000/api/v1/member
 *
 *
 */
router.post('/member', [
    body('name').trim().notEmpty().isString(),
    body('companyId').notEmpty().toInt().isInt({ min: 1 }),
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isString(),
    body('role').trim().notEmpty().isString(),
    body('department').trim().notEmpty().isString(),
    body('phoneNumber').notEmpty().isString()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const authPayload: AuthTokenPayload | undefined = req.user
            if(!authPayload){
                res.sendStatus(403);
                return
            }

            await dsMgr.createUser(req.body, authPayload);
            res.sendStatus(200);

        } catch (err) {
            if (err instanceof UserModificationError) {
                res.sendStatus(406);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
});

/**
 *  Updates user data.
 *      Request param:
 *          curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\":\"渡辺\", \"role\":\"MEMBER\", \"department\":\"営業\",
 *          \"phoneNumber\":\"090-1111-2222\", \"status\":true}" http://localhost:4000/api/v1/member/32
 *
 *
 */
router.put('/member/:id', [
    param('id').exists().isNumeric(),
    body('name').trim().notEmpty().isString(),
    body('role').trim().notEmpty().isString(),
    body('department').trim().notEmpty().isString(),
    body('phoneNumber').trim().notEmpty().isString(),
    body('status').notEmpty().isBoolean()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
    try {

        const authPayload: AuthTokenPayload | undefined = req.user
        if(!authPayload){
            res.sendStatus(403);
            return
        }
        const userId = Number(req.params.id);
        await dsMgr.updateUser(userId, authPayload, req.body);
        res.sendStatus(200);

    } catch (err) {
        if (err instanceof UserModificationError) {
            res.sendStatus(406);
        } else {
            res.sendStatus(500);
        }
        return next(err);
    }
});

/**
 * Changes the user's password.
 * Request param:
 *          curl -i -X PATCH -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"currentPassword\":\"1234\", \"newPassword\":\"12345\" }" http://localhost:4000/api/v1/password/32
 *
 */
router.patch('/password/:id', [
    param('id').exists().isNumeric(),
    body('currentPassword').notEmpty().isString(),
    body('newPassword').notEmpty().isString(),
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
    try {

        const authPayload: AuthTokenPayload | undefined = req.user
        if(!authPayload){
            res.sendStatus(403);
            return
        }

        const userId = Number(req.params.id)
        await dsMgr.changeUserPassword(userId, authPayload, req.body);
        res.sendStatus(200);

    } catch (err) {
        if (err instanceof UserModificationError) {
            res.sendStatus(406);
        } else {
            res.sendStatus(500);
        }
        return next(err);
    }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});