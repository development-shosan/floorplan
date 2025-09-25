"use client";

import { LoginResponse, useUser } from "@/hooks/userContext";
import { loginUser } from "@/lib/api";
import { HomeIcon } from "@heroicons/react/20/solid";
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

    if (loading) return;

    setEmailError("");
    setPasswordError("");
    setLoginError("");

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
    } catch (err: unknown) {
      console.error(err);

      let message: string;

      if (err instanceof Error) {
        message = err.message.includes("(401)")
          ? "メールアドレスまたはパスワードが正しくありません"
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
      <div
        className="w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[25vw] 
                rounded-lg bg-gray-50 shadow-sm px-6 py-8 border border-gray-300"
      >
        {/* タイトル */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-3">
            <h1 className="flex items-center text-3xl sm:text-4xl space-x-3">
              <HomeIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              <span>Plan Butler</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-500">{"営業支援ツール"}</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-600 text-base font-medium mb-2"
            >
              {"メールアドレス"}
            </label>
            <input
              id="email"
              placeholder="example@company.co.jp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 text-md border border-gray-300 rounded-md bg-white focus:outline-none focus:border-[#667eea]" // py-2 → py-3
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2">{emailError}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-600 text-base font-medium mb-2"
            >
              {"パスワード"}
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 text-md border border-gray-300 rounded-md bg-white focus:outline-none focus:border-[#667eea]"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 px-4 rounded-md transition duration-300 ${
              loading ? "bg-gray-400" : "bg-gray-800 hover:bg-gray-600"
            }`}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        {/* パスワード忘れ */}
        <div className="mt-6 text-center text-base">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsModalVisible(true);
            }}
            className="text-gray-500 mb-4 hover:underline"
          >
            {"パスワードを忘れた方はこちら"}
          </a>
        </div>

        {/* ログインエラー表示 */}
        {loginError && (
          <div className="mt-8 p-4 bg-[#FDF9F2] border-l-4 border-[#E5933C] rounded-md">
            <p className="flex items-center text-[#B07020] text-[15px]">
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
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {"お知らせ"}
              </h3>
              <p className="text-md text-gray-600">
                {"管理者にお問い合わせください"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
