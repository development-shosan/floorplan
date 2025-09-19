// APIリクエストを送信するための共通関数をここに定義します。
// これにより、fetchの呼び出し元で毎回ヘッダーやエラーハンドリングを記述する必要がなくなります。

import { UserFormData } from "@/constants/user";
import { LoginResponse } from "@/hooks/userContext";
import { jwtDecode } from "jwt-decode";

// トークンの有効期限チェック
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return !exp || Date.now() >= exp * 1000;
  } catch (err) {
    console.error("Invalid token:", err);
    return true;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function parseResponse(response: Response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const userJson = sessionStorage.getItem("user");
  let token: string | null = null;

  if (userJson) {
    const user: LoginResponse = JSON.parse(userJson);
    token = user.token;

    // トークンの有効期限が切れた場合、ログイン画面に遷移
    if (isTokenExpired(token)) {
      sessionStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Token expired");
    }

    (headers as Record<string, string>)["Authorization"] = `${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const newToken = response.headers.get("Authorization");
  if (newToken) {
    if (userJson) {
      const user: LoginResponse = JSON.parse(userJson);
      user.token = newToken;
      sessionStorage.setItem("user", JSON.stringify(user));

      (headers as Record<string, string>)["Authorization"] = `${newToken}`;
    }
  }

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
      case 406:
        throw new Error("⚠️ エラー: 管理者にお問い合わせください (406)");
      case 500:
        throw new Error("⚠️ エラー: サーバー内部エラー (500)");
      default:
        throw new Error(`⚠️ エラー: 不明なエラー (${response.status})`);
    }
  }

  return parseResponse(response);
}

// 以下に各APIエンドポイントに対応する関数を定義します

// ログイン
export const loginUser = (email: string, password: string) => {
  return fetchApi("/api/v1/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

// ユーザー一覧
export const getUserList = (user: LoginResponse) => {
  const role = user.role;

  let url = "";

  if (role === "COMPANY_ADMIN") {
    url = `/api/v1/members/${role}/company/${user.companyId}`;
  } else {
    url = `/api/v1/members/${role}`;
  }

  return fetchApi(url, { method: "GET" });
};

// ユーザー登録
export const createUser = (formUser: UserFormData) => {
  const { name, companyId, email, password, role, department, phoneNumber } =
    formUser;

  return fetchApi("/api/v1/members", {
    method: "POST",
    body: JSON.stringify({
      name,
      companyId,
      email,
      password,
      role,
      department,
      phoneNumber,
    }),
  });
};

// ユーザー編集
export const updateUser = (formUser: UserFormData, id: number) => {
  const { name, companyId, email, password, role, department, phoneNumber } =
    formUser;

  return fetchApi(`/api/v1/members/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      companyId,
      email,
      password,
      role,
      department,
      phoneNumber,
    }),
  });
};

// ユーザー削除
export const deleteUser = (id: number) => {
  return fetchApi(`/api/v1/members/${id}`, { method: "DELETE" });
};

// 会社一覧
export const getCompanyList = () => {
  return fetchApi("/api/v1/companies", { method: "GET" });
};
