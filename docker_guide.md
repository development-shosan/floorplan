# Docker運用ガイド

**バージョン:** 1.0
**作成日:** 2025年8月21日

---

## 1. 概要

このドキュメントは、`docker-compose`を使用して`crm-project`のローカル開発環境を運用するための主要なコマンドとTipsをまとめたものです。

本プロジェクトは以下の4つのコンテナで構成されています。
- `frontend`: Next.jsで構築されたフロントエンドアプリケーション
- `backend`: Express.jsで構築されたバックエンドAPIサーバー
- `python-backend`: FastAPIで構築されたPython APIサーバー
- `db`: MySQLデータベース

---

## 2. 主要コマンド

コマンドはすべて、プロジェクトのルートディレクトリ（`docker-compose.yml`がある場所）で実行してください。

### 全サービスの起動

フォアグラウンドで起動し、全サービスのログをまとめて表示します。`Ctrl + C`で停止します。
```bash
docker-compose up
```

バックグラウンドで起動します。ターミナルを解放したい場合に便利です。
```bash
docker-compose up -d
```

### 全サービスの停止

バックグラウンドで起動したコンテナを停止します。
```bash
docker-compose down
```
データベースのボリューム(`mysql-data`)も完全に削除して、クリーンな状態に戻したい場合は`-v`オプションを付けます。
```bash
docker-compose down -v
```

### サービスの再ビルド

`Dockerfile`や、`package.json`, `requirements.txt`など、イメージの構成に関わるファイルを変更した場合は、`--build`オプションを付けて起動し、イメージを再ビルドします。
```bash
docker-compose up --build -d
```

### ログの確認

全サービスのログをリアルタイムで表示します。
```bash
docker-compose logs -f
```

特定のサービスのログのみを表示したい場合は、サービス名を指定します。
```bash
# バックエンドのログのみ表示
docker-compose logs -f backend

# Pythonサービスのログのみ表示
docker-compose logs -f python-backend
```

### コンテナの状態確認

現在起動しているコンテナの状態（State）やポート（Ports）を確認できます。
```bash
docker-compose ps
```

---

## 3. 個別サービスの操作

特定のサービスだけを再起動したい場合などに使用します。

```bash
# backendサービスのみを再起動
docker-compose restart backend

# frontendサービスのみを停止
docker-compose stop frontend

# 停止したfrontendサービスを起動
docker-compose start frontend
```

---

## 4. データベースの操作

### データベースマイグレーション

`backend/prisma/schema.prisma`ファイルを変更してデータベーススキーマを更新した場合、以下のコマンドで変更をデータベースに適用します。

```bash
docker-compose exec backend npx prisma migrate dev
```
`--name`フラグでマイグレーションに名前を付けることもできます。

### データベースへの直接接続

MySQLクライアントなどから、ローカルのデータベースに接続できます。
- **ホスト:** `localhost`
- **ポート:** `3306`
- **ユーザー:** `user`
- **パスワード:** `password`
- **データベース名:** `crm_db`
  （これらの値は`.env`ファイルで設定されています）

コンテナ内からMySQL CLIを直接実行することも可能です。
```bash
# dbコンテナ内でmysqlコマンドを実行
docker-compose exec db mysql -u root -p

# (パスワード入力を求められるので、.envのMYSQL_ROOT_PASSWORDを入力)
```

---

## 5. トラブルシューティング

### "Port is already allocated" / "address already in use"
- **原因:** `docker-compose.yml`で定義されているポート（3000, 4000, 8000, 3306）が、ローカルマシン上の他のプロセスですでに使用されています。
- **対策:** `docker-compose ps`や他のOS標準のコマンドでポートを使用しているプロセスを特定し、停止してください。または、`docker-compose.yml`のポートマッピング（例: `"3001:3000"`）を変更して、ホスト側のポート番号を変えてください。

### "ECONNREFUSED"
- **原因:** サービス間の接続が拒否された場合に発生します。よくあるのは、接続先のコンテナが起動に失敗している、またはクラッシュしているケースです。
- **対策:** `docker-compose logs [サービス名]`で、接続先サービスのログを確認し、エラーが出ていないか確認してください。

---

## 6. テストの実行

各サービスのテストは、起動しているDockerコンテナに対して実行します。

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
# 依存関係のインストール（初回またはrequirements.txt変更時）
docker-compose exec python-backend pip install -r requirements.txt

# テスト実行
docker-compose exec python-backend pytest
```
