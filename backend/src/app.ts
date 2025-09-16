/*
   src/app.ts
*/
import express from 'express';
import dotenv from 'dotenv';
import DSMgr from './DSMgr';
import { LoginError } from './ApplicationErrors';
import morgan from 'morgan';
import cors from 'cors';
import { refreshTokenIfValid } from "./middlewares/auth.middleware";
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

// TODO: Test only – to be removed
/**
 *      Request param:
 *          curl -i -X GET -H "Content-Type: application/json"
 *               -H "Authorization: TOKEN" http://localhost:4000/api/v1/tokenTest
 *
 */
router.get('/tokenTest', refreshTokenIfValid, (req, res) => {
    res.status(200).send('Token successfully verified and reissued.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});