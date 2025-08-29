import express from 'express';
import dotenv from 'dotenv';

dotenv.config(); // .env ファイルを読み込む

const app = express();
const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});