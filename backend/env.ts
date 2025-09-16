/*
   .env configuration with TypeScript
 */
import dotenv from 'dotenv';

// .env ファイルを読み込んで process.env に設定
dotenv.config();

// 環境変数をエクスポート
// 注意: process.envの値はすべてstring | undefined になります。
// 使用する側で型変換や存在チェックが必要です。
export const env = {
    WEB_SERVER_PORT: process.env.WEB_SERVER_PORT,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    TOKEN_EXPIRES: process.env.TOKEN_EXPIRES,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    PYTHON_API_URL: process.env.PYTHON_API_URL,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT
};
