/*
   src/app.ts
*/
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import DSMgr from './DSMgr';
import { LoginError } from './ApplicationErrors';
import morgan from 'morgan';
import cors from 'cors';
import { refreshTokenIfValid } from './middlewares/auth.middleware';
import { body, param, query, validationResult } from 'express-validator';
dotenv.config(); // .env ファイルを読み込む

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 4000;
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
router.post('/login', async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password) {
            res.sendStatus(400);
            return
        }
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



router.get('/members', async (req, res, next) => {
    try {

        // role, companyId param
        const result = await dsMgr.getUsers();
        res.json(result);

    } catch (err) {
        return next(err);
    }
});

router.post('/member', [
    body('name').trim().notEmpty().isString(),
    body('companyId').trim().notEmpty().isNumeric(),
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isString(),
    body('role').trim().notEmpty().isString(),
    body('department').trim().notEmpty().isString(),
    body('phoneNumber').trim().notEmpty().isString()
    ],
    // refreshTokenIfValid,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            await dsMgr.createUser(req.body);
            res.status(200);

        } catch (err) {

            res.status(500);
            return next(err);
        }
});

// /**
//  *
//  */
router.put('/member/:id', [
    param('id').exists().trim().isNumeric(),
    body('name').trim().notEmpty().isString(),
    body('companyId').trim().notEmpty().isNumeric(),
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isString(),
    body('role').trim().notEmpty().isString(),
    body('department').trim().notEmpty().isString(),
    body('phoneNumber').trim().notEmpty().isString(),
    body('status').trim().notEmpty().isBoolean()
    ],
    // refreshTokenIfValid,
    async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await dsMgr.updateUser(Number(req.params.id), req.body);
        res.status(200);

    } catch (err) {

        res.status(500);
        return next(err);
    }
});

// /**
//  *
//  */
router.patch('/member/:id', [
    param('id').exists().trim().isNumeric()
    ],
    // refreshTokenIfValid,
    async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await dsMgr.deleteUser(Number(req.params.id));
        res.status(200);

    } catch (err) {

        res.status(500);
        return next(err);
    }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});