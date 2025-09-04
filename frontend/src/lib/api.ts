// APIリクエストを送信するための共通関数をここに定義します。
// これにより、fetchの呼び出し元で毎回ヘッダーやエラーハンドリングを記述する必要がなくなります。

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 必要に応じて認証トークンをヘッダーに追加
  // const token = localStorage.getItem('token');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // エラーレスポンスをパースして、より詳細なエラー情報を提供する
    switch (response.status) {
      case 400:
        throw new Error("⚠️ エラー: 不正なリクエスト (400)");
      case 401:
        throw new Error("⚠️ エラー: 認証に失敗しました (401)");
      case 403:
        throw new Error("⚠️ エラー: アクセスが禁止されています (403)");
      case 404:
        throw new Error("⚠️ エラー: リソースが見つかりません (404)");
      case 500:
        throw new Error("⚠️ エラー: サーバー内部エラー (500)");
      default:
        throw new Error(`⚠️ エラー: 不明なエラー (${response.status})`);
    }
  }

  return response.json();
}

// 以下に各APIエンドポイントに対応する関数を定義します

// 例: チームメンバーを取得するAPI
export const getTeamMembers = () => {
  return fetchApi("/api/admin/team/members", { method: "GET" });
};

// 例: 新しいメンバーを作成するAPI
export const createTeamMember = (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return fetchApi("/api/admin/team/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ログイン
export const loginUser = (email: string, password: string) => {
  return fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};
