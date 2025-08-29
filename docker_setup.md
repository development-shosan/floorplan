# Docker環境構築セットアップガイド

**バージョン:** 1.0
**作成日:** 2025年8月21日

---

## 1. 目的

このドキュメントは、「AI間取図提案アプリケーション」の開発に参加する新しい開発者が、Dockerを使用してローカル開発環境を迅速に構築するための手順を説明します。

この手順に従うことで、ローカルマシンにNode.jsやPython、MySQLなどを個別にインストールすることなく、プロジェクト全体の環境をコンテナとして一貫性のある形でセットアップできます。

---

## 2. 事前準備

開発を開始する前に、お使いのPCに以下のソフトウェアがインストールされていることを確認してください。

-   **Git:** ソースコードをリポジトリからクローンするために必要です。
    -   [Git 公式サイト](https://git-scm.com/)
-   **Docker Desktop:** DockerおよびDocker Composeを利用するために必須です。
    -   [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
    -   [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
    -   [Docker Desktop for Linux](https://docs.docker.com/desktop/install/linux-install/)

**ポイント:** Dockerを利用するため、ローカルマシンに **Node.js, npm, Python, pip, MySQLなどを直接インストールする必要はありません。** すべてDockerコンテナ内で実行されます。

---

## 3. プロジェクトの準備

### 3.1. ソースコードのクローン

まず、ターミナル（コマンドプロンプトやPowerShellなど）を開き、作業したいディレクトリに移動して、GitHubリポジトリからプロジェクトのソースコードをローカルにクローンします。

```bash
git clone https://github.com/your-organization/crm-app.git # リポジトリURLは適宜変更してください
cd crm-project
```

### 3.2. 環境変数ファイル(.env)の作成

次に、Dockerコンテナが読み込む環境変数を設定します。

1.  クローンしたプロジェクトのルートディレクトリ（`crm-project/`）に、`.env`という名前のファイルを新規作成します。

2.  以下の内容をコピーして`.env`ファイルに貼り付け、保存します。ローカルでの開発では、この内容をそのまま使用して問題ありません。

    ```dotenv
    # .env - ローカル開発用設定

    # MySQL DB 設定
    DATABASE_URL="mysql://user:password@db:3306/crm_db"
    MYSQL_ROOT_PASSWORD=rootpassword
    MYSQL_DATABASE=crm_db
    MYSQL_USER=user
    MYSQL_PASSWORD=password

    # JWT 秘密鍵
    JWT_SECRET=your-super-secret-jwt-key-for-local-dev

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

**重要:** この`.env`ファイルはGitの管理対象外です。機密情報を含むため、リポジトリにはコミットしないでください。

---

## 4. 初回ビルドと起動

環境変数の設定が完了したら、プロジェクトの全サービスのDockerイメージをビルドし、コンテナを起動します。

1.  ターミナルでプロジェクトのルートディレクトリ（`crm-project/`）にいることを確認します。

2.  以下のコマンドを実行します。

    ```bash
    docker-compose up --build
    ```
    - `--build`オプションは、`Dockerfile`に変更があった場合にイメージを再ビルドします。初回起動時には必ず付けてください。
    - 各サービスのイメージビルドと依存関係のインストールが実行されるため、初回は時間がかかります。

3.  ビルドと起動が完了したら、データベースのマイグレーションが必要です。新しいターミナルを開き、以下のコマンドを実行してください。

    ```bash
    # `backend`サービス内でマイグレーションコマンドを実行
    docker-compose exec backend npx prisma migrate dev --name init
    ```

これで基本的なセットアップは完了です。

---

## 5. テストによる環境確認

最後に、各サービスが正しく構築され、連携していることを確認するためにテストを実行します。

```bash
# フロントエンドのテスト実行
docker-compose exec frontend npm test

# バックエンドのテスト実行
docker-compose exec backend npm test

# Python APIのテスト実行
docker-compose exec python-backend pytest
```

すべてのテストが成功すれば、開発環境の構築は完了です。
日々の開発運用については `docker_guide.md` を参照してください。
