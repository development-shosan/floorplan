# 1. ベースイメージ設定 (Node.js 18 LTSバージョン)
FROM node:18-alpine

# 2. 作業ディレクトリ設定
WORKDIR /app

# 3. package.json 及び package-lock.json のコピー
COPY package*.json ./

# 4. 依存関係のインストール
RUN npm ci

# 5. ソースコードのコピー
COPY . .

# 6. Next.jsが使用するポートを公開
EXPOSE 3000

# 7. 開発サーバーの実行
CMD ["npm", "run", "dev"]
