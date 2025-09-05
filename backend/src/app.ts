/*
   src/app.ts
*/
import express from 'express';
import dotenv from 'dotenv';
import DSMgr from './DSMgr';
import { LoginError } from './ApplicationErrors';
dotenv.config(); // .env ファイルを読み込む

const app = express();
const PORT = process.env.PORT || 4000;
const dsMgr = new DSMgr();

// JSONボディパーサーを有効にする
app.use(express.json());

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
 *               -d "{\"email\":\"user@example.com\",\"password\":\"1234\"}" http://localhost:4000/login
 *
 *      Response: Object<LoginResult>
 */
app.post('/login', async (req, res, next) => {
    try {
        if (req.body.email && req.body.password) {
            const result = await dsMgr.login(req.body.email, req.body.password);
            res.json(result);
        } else {
            res.sendStatus(400);
        }
    } catch (err) {
        if (err instanceof LoginError) {
            res.sendStatus(401);
        } else {
            res.sendStatus(500);
        }
    }
    return next();
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});