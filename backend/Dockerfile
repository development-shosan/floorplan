# 1. ベースイメージ設定 (Node.js 18 LTSバージョン)
FROM node:18-alpine

# 2. 作業ディレクトリ設定
WORKDIR /app

# 3. package.json 及び package-lock.json のコピー
COPY package*.json ./

# 4. 依存関係のインストール
# package-lock.jsonに基づいた高速で信頼性の高いインストール
RUN npm ci

# 5. ソースコードのコピー
COPY . .

# 6. Prismaクライアントの生成
RUN npx prisma generate

# 7. Expressサーバーが使用するポートを公開
EXPOSE 4000

# 8. コンテナ起動時のコマンド
CMD ["npm", "run", "docker:start"]