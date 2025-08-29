import { useState, useEffect } from 'react';

// 仮の型定義
interface User {
  id: string;
  name: string;
  email: string;
}

// このフックは、認証状態を管理し、現在ログインしているユーザーの情報を返します。
// 実際のプロジェクトでは、Contextや状態管理ライブラリ(Zustand, Redux)と組み合わせて使用します。
export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ここで認証状態を確認し、ユーザー情報を取得する非同期処理を呼び出します。
    // 例: /api/auth/me エンドポイントへのフェッチ
    const fetchUser = async () => {
      try {
        // const response = await fetch('/api/auth/me');
        // if (!response.ok) {
        //   throw new Error('Not authenticated');
        // }
        // const userData: User = await response.json();
        // setUser(userData);

        // --- 以下はダミーデータです ---
        setUser({ id: '1', name: 'Taro Yamada', email: 'taro@example.com' });
        // --- ダミーデータここまで ---

      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};
