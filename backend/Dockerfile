# 1. ベースイメージ設定 (Node.js 18 LTSバージョン)
FROM node:18-alpine

# 2. 作業ディレクトリ設定
WORKDIR /app

# 3. package.json 及び package-lock.json のコピー
COPY package*.json ./

# 4. 依存関係のインストール
RUN npm install --production=false && npm install ts-node-dev @types/express @types/node

# 5. Prismaスキーマのコピー
COPY prisma ./

# 6. Prismaクライアントの生成
RUN npx prisma generate

# 7. ソースコードのコピー
COPY . .

# 8. Expressサーバーが使用するポートを公開
EXPOSE 4000

# 9. 開発サーバーの実行
CMD ["npm", "run", "dev"]
