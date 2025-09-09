"use client";

import { LoginResponse, useUser } from "@/hooks/userContext";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent, useEffect } from "react";

// ログイン
const LoginForm: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useUser();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  // すでにログインしている場合は、ホーム画面に遷移
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  // バリデーションチェック
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
  };

  // ログイン
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    let isValid = true;

    if (!email.trim()) {
      setEmailError("メールアドレスを入力してください。");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("メールアドレスの形式が正しくありません。");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("パスワードを入力してください。");
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      // ログインAPI
      const data: LoginResponse = await loginUser(email, password);

      setUser(data);

      // ログイン成功したらHOME画面に遷移
      router.push("/home");
    } catch (err: unknown) {
      console.error(err);

      let message: string;

      if (err instanceof Error) {
        message = err.message.includes("(401)")
          ? "⚠️ エラー: メールアドレスまたはパスワードが正しくありません (401)"
          : `${err.message}`;
      } else {
        message = "⚠️ エラー: 不明なエラーが発生しました";
      }

      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[400px] rounded-lg bg-gray-50 shadow-sm px-5 py-6 border-2 border-dashed border-gray-300">
        {/* タイトル */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-1">
            <span className="text-3xl">🏠</span>
            <h1 className="text-[28px] font-bold text-[#667eea] ml-2">
              間取り生成システム
            </h1>
          </div>
          <p className="text-[16px] text-gray-500">営業支援ツール</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-gray-600 text-sm font-medium mb-1"
            >
              メールアドレス
            </label>
            <input
              id="email"
              placeholder="example@company.co.jp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-2 text-md border border-gray-300 rounded-md bg-white focus:outline-none focus:border-[#667eea]"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-gray-600 text-sm font-medium mb-1"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-[#667eea]"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[#667eea] hover:bg-[#5a6cdb] text-white font-bold py-2 px-4 rounded-sm transition duration-300"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        {/* パスワード忘れ */}
        <div className="mt-4 text-center text-sm">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsModalVisible(true);
            }}
            className="text-[#667eea] hover:underline"
          >
            パスワードを忘れた方はこちら
          </a>
        </div>

        {/* ログインエラー表示 */}
        {loginError && (
          <div className="mt-6 p-3 bg-[#FDF9F2] border-l-4 border-[#E5933C] rounded-sm">
            <p className="flex items-center text-[#B07020] text-[14px]">
              {loginError}
            </p>
          </div>
        )}
      </div>

      {/* モーダル */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-xs rounded-lg bg-gray-50 shadow-lg p-5 border-2 border-dashed border-gray-300 relative">
            <button
              onClick={() => setIsModalVisible(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Close modal"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">お知らせ</h3>
              <p className="text-md text-gray-600">
                管理者にお問い合わせください
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
