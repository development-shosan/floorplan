# python image
FROM python:3.10-slim

# Directory 設定
WORKDIR /app

# requirements.txt コピー
COPY requirements.txt .

# 依存関係インストール
RUN pip install --no-cache-dir -r requirements.txt

# コードコピー
COPY . .

# ポート設定：8000
EXPOSE 8000

# uvicornでFastAPIのアプリケーションの実行
# --host 0.0.0.0として設定。外部から接続できるように
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
