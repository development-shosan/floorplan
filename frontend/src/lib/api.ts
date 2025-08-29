// APIリクエストを送信するための共通関数をここに定義します。
// これにより、fetchの呼び出し元で毎回ヘッダーやエラーハンドリングを記述する必要がなくなります。

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}

// 以下に各APIエンドポイントに対応する関数を定義します

// 例: チームメンバーを取得するAPI
export const getTeamMembers = () => {
  return fetchApi('/api/admin/team/members', { method: 'GET' });
};

// 例: 新しいメンバーを作成するAPI
export const createTeamMember = (data: { name: string; email: string; password: string }) => {
  return fetchApi('/api/admin/team/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
