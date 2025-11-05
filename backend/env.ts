/*
   Type-safe .env configuration with TypeScript
 */
import { load, EnvType } from 'ts-dotenv';

const schema = {
    NODE_ENV: ['production', 'development'],
    WEB_SERVER_PORT: Number,
    TOKEN_SECRET: String,
    TOKEN_EXPIRES: String,
    PYTHON_API_URL: String
};

declare type Env = EnvType<typeof schema>;

export const env: Env = load(schema);
