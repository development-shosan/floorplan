# CRM Application (Next.js + Express + Python + MySQL) - 実行マニュアル

このドキュメントは、Dockerを使用して当CRMアプリケーションをローカル環境でセットアップし、実行するための手順を説明します。
本アプリケーションは、Next.jsによるフロントエンド、Expressによるバックエンド、そしてPython (FastAPI)による間取図生成APIの3つのサービスで構成されています。

---

## 目次

1.  [プロジェクトの取得](#1-プロジェクトの取得)
2.  [クイックスタート](#2-クイックスタート)
3.  [初回セットアップ](#3-初回セットアップ)
4.  [アプリケーションの実行](#4-アプリケーションの実行)
5.  [アプリケーションへのアクセス](#5-アプリケーションへのアクセス)
6.  [アプリケーションの停止](#6-アプリケーションの停止)
7.  [テストの実行](#7-テストの実行)
8.  [【付録】Gemini CLIの活用](#8-付録gemini-cliの活用)

---

## 1. プロジェクトの取得

まず、GitHubリポジトリからプロジェクトのソースコードをローカルにクローンします。

```bash
git clone https://github.com/your-organization/crm-app.git # リポジトリURLは適宜変更してください
cd crm-project
```

---

## 2. クイックスタート

プロジェクトのクローン後、以下のコマンド一つでアプリケーションを起動できます。

```bash
docker-compose up --build
```

**注意:** 初めてこのコマンドを実行する場合、データベースのスキーマ適用が必要です。詳細は「[4. アプリケーションの実行](#4-アプリケーションの実行)」を参照してください。

---

## 3. 初回セットアップ

プロジェクトを初めて利用する場合、またはクリーンな状態からセットアップする場合に必要な手順です。

### 3.1. 事前準備

開発を開始する前に、お使いのPCに以下のソフトウェアがインストールされていることを確認してください。

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
-   [Node.js](https://nodejs.org/) (npmを含む)
-   [Python 3.10+](https://www.python.org/)

Dockerがバックグラウンドで実行されていることを確認してください。

### 3.2. 依存関係のインストール

各サービスの開発に必要な依存関係をインストールします。これは主に、Dockerを使わずにローカルで各サービスを個別に実行したい開発者向けの手順です。

#### a. バックエンド (Express)

`backend` ディレクトリに移動し、依存関係をインストールします。
```bash
cd backend
npm install
cd ..
```

#### b. フロントエンド (Next.js)

`frontend` ディレクトリに移動し、依存関係をインストールします。
```bash
cd frontend
npm install
cd ..
```

#### c. Pythonバックエンド (FastAPI)

`python` ディレクトリに移動し、必要なライブラリをインストールします。
```bash
cd python
pip install -r requirements.txt
cd ..
```

### 3.3. 環境変数の設定

プロジェクトのルート (`crm-project`) に `.env` ファイルを作成し、以下の内容を参考に、ご自身の環境に合わせて各値を設定してください。

```dotenv
# .env

# MySQL DB 設定 (docker-compose.yml の db サービスと同期)
DATABASE_URL="mysql://user:password@db:3306/crm_db"
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=crm_db
MYSQL_USER=user
MYSQL_PASSWORD=password

# JWT 秘密鍵 (任意の文字列に変更)
JWT_SECRET=your-super-secret-jwt-key

# AWS S3 設定 (ローカル開発ではダミー値でOK)
AWS_S3_BUCKET_NAME=your-local-s3-bucket-name
AWS_ACCESS_KEY_ID=your-local-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-local-aws-secret-access-key
AWS_REGION=ap-northeast-1

# フロントエンドがバックエンドAPIにアクセスするためのURL
NEXT_PUBLIC_API_URL=http://localhost:4000

# バックエンドがPython APIにアクセスするためのURL
PYTHON_API_URL=http://python-backend:8000
```

**重要:**
- この`.env`ファイルは、`docker-compose`でアプリケーションを起動する際に自動的に読み込まれます。
- もしDockerを使わず、`backend`や`frontend`の各ディレクトリで直接`npm run dev`などを実行して開発する場合は、この`.env`ファイルを各ディレクトリにコピーするか、それぞれのディレクトリから参照できるようにシンボリックリンクを作成してください。
- `.env` ファイルは機密情報を含むため、Git管理から除外してください。通常、`.gitignore` に `/.env` が含まれています。

---

## 4. アプリケーションの実行

すべての初期セットアップが完了したら、プロジェクトのルートディレクトリ (`crm-project`) で以下のコマンドを実行し、Dockerコンテナを起動します。

```bash
docker-compose up --build
```

起動後、**初めてDBを構築する場合**は、データベースのスキーマを適用する必要があります。以下の手順で `backend` コンテナ内でマイグレーションを実行してください。

1.  **`backend` コンテナのシェルに接続:**
    ```bash
    docker-compose exec backend sh
    ```
2.  **コンテナ内でPrismaマイグレーションを実行:**
    ```bash
    npx prisma migrate dev --name init
    ```
3.  **シェルを終了:**
    ```bash
    exit
    ```

---

## 5. アプリケーションへのアクセス

コンテナが正常に起動したら、以下のURLにアクセスできます。

-   **フロントエンド (Next.js):** [http://localhost:3000](http://localhost:3000)
-   **バックエンド API (Express):** [http://localhost:4000](http://localhost:4000)
-   **Python API (FastAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 6. アプリケーションの停止

アプリケーションを停止するには、プロジェクトのルートディレクトリで以下のコマンドを実行します。

```bash
docker-compose down
```

コンテナ、ネットワーク、ボリュームを全て削除したい場合は、以下を実行します。

```bash
docker-compose down -v
```

---

## 7. テストの実行

各サービスのテストは、Dockerコンテナ内で実行することを推奨します。これにより、どの開発者でも同じ環境でテスト結果を再現できます。

### a. フロントエンド (Jest / Playwright)

```bash
# 単体・結合テスト (Jest)
docker-compose exec frontend npm test

# E2Eテスト (Playwright)
docker-compose exec frontend npm run e2e
```

### b. バックエンド (Jest / Supertest)

```bash
docker-compose exec backend npm test
```

### c. Python API (Pytest)

```bash
docker-compose exec python-backend pytest
```

---

## 8. 【付録】Gemini CLIの活用

[Gemini CLI](https://ai.google.dev/docs/gemini_cli) を利用すると、このマニュアルに記載されている多くの手動設定を、対話形式のプロンプトで自動化できます。

#### a. Gemini CLI のインストール

ターミナルで以下のコマンドを実行して、Gemini CLIをグローバルにインストールします。

```bash
npm install -g @google/gemini-cli
```

インストール後、`gemini` コマンドで認証と初期設定を行ってください。

```bash
gemini auth
```

#### b. Gemini CLI を使った設定の自動化

Gemini CLIを起動し、以下のようなプロンプトを送信することで、ファイル作成やコマンド実行を自動化できます。

**例1: `backend`の`package.json`を作成し、ライブラリをインストールする**

```
Gemini, can you run the following commands in the `backend` directory?
1. `npm init -y`
2. `npm install express cors dotenv jsonwebtoken zod`
3. `npm install prisma --save-dev`
```

**例2: Dockerコンテナをビルドしてバックグラウンドで実行する**

```
Gemini, please run `docker-compose up --build -d` in the project root directory.
```

**例3: ファイルの内容を修正する**

```
Gemini, please open `backend/prisma/schema.prisma` and replace the existing content with the following schema: ... (ここに新しいスキーマを貼り付け)
```

このように、Gemini CLIに具体的な指示を与えることで、開発のセットアップをより迅速かつ効率的に進めることができます。