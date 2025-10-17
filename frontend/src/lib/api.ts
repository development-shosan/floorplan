import { CompanyFormData } from "@/constants/company";
import { History, HistoryChildren } from "@/constants/history";
import { UserFormData } from "@/constants/user";
import { LoginResponse } from "@/hooks/userContext";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface TokenPayload {
  role: "MEMBER" | "COMPANY_ADMIN" | "SYSTEM_ADMIN";
  companyId?: number;
}

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

export function getTokenPayload(token: string | null): TokenPayload | null {
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

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

    if (isTokenExpired(token)) {
      sessionStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Token expired");
    }

    const payload = getTokenPayload(token);
    if (payload) {
      user.role = payload.role;
      user.companyId = payload.companyId;
      sessionStorage.setItem("user", JSON.stringify(user));
    }

    (headers as Record<string, string>)["Authorization"] = `${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const newToken = response.headers.get("Authorization");
  if (newToken && userJson) {
    const user: LoginResponse = JSON.parse(userJson);
    user.token = newToken;

    const payload = getTokenPayload(newToken);
    if (payload) {
      user.role = payload.role;
      user.companyId = payload.companyId;
      sessionStorage.setItem("user", JSON.stringify(user));
    }
    (headers as Record<string, string>)["Authorization"] = `${newToken}`;
  }

  if (!response.ok) {
    switch (response.status) {
      case 204:
        throw new Error("⚠️ エラー: No Content (204)");
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

// ログイン
export const loginUser = (email: string, password: string) => {
  return fetchApi("/api/v1/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

// ユーザー情報一覧
export const getUserList = () => {
  return fetchApi("/api/v1/members", { method: "GET" });
};

// ユーザー情報登録
export const createUser = (formUser: UserFormData) => {
  const { name, companyId, email, password, role, department, phoneNumber } =
    formUser;

  return fetchApi("/api/v1/member", {
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

// ユーザー情報更新
export const updateUser = (formUser: UserFormData) => {
  const { id, name, role, department, phoneNumber, status } = formUser;

  return fetchApi(`/api/v1/member/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      role,
      department,
      phoneNumber,
      status,
    }),
  });
};

// ユーザー情報削除
export const deleteUser = (formUser: UserFormData) => {
  const { id } = formUser;
  return fetchApi(`/api/v1/member/${id}`, { method: "PATCH" });
};

// ユーザーパスワード変更
export const changePassword = (id: number, newPassword: string) => {
  return fetchApi(`/api/v1/password/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      newPassword,
    }),
  });
};

// 会社情報一覧
export const getCompanyList = () => {
  return fetchApi("/api/v1/companies", { method: "GET" });
};

// 会社情報登録
export const createCompany = (formCompany: CompanyFormData) => {
  const {
    name,
    nameKana,
    representative,
    email,
    postalCode,
    prefecture,
    city,
    streetAddress,
  } = formCompany;

  return fetchApi("/api/v1/company", {
    method: "POST",
    body: JSON.stringify({
      name,
      nameKana,
      representative,
      email,
      postalCode,
      prefecture,
      city,
      streetAddress,
    }),
  });
};

// 会社情報更新
export const updateCompany = (formCompany: CompanyFormData) => {
  const {
    id,
    name,
    nameKana,
    representative,
    email,
    postalCode,
    prefecture,
    city,
    streetAddress,
    status,
  } = formCompany;

  return fetchApi(`/api/v1/company/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      nameKana,
      representative,
      email,
      postalCode,
      prefecture,
      city,
      streetAddress,
      status,
    }),
  });
};

// 会社情報削除
export const deleteCompany = (formCompany: CompanyFormData) => {
  const { id } = formCompany;
  return fetchApi(`/api/v1/company/${id}`, { method: "PATCH" });
};

// 対応履歴一覧
export const getHistoryList = (userId: number) => {
  return fetchApi(`/api/v1/histories/${userId}`, { method: "GET" });
};

// 対応履歴詳細
export const getHistoryChildren = (userId: number, history: History) => {
  const { id } = history;
  const historyParentId = id;
  return fetchApi(`/api/v1/historyChildren/${historyParentId}/user/${userId}`, {
    method: "GET",
  });
};

// 間取り生成リクエスト

// 間取り生成ステータス確認

// 間取り生成結果取得

// プランお気に入り登録/解除
export const togglePlanFavorite = (child: HistoryChildren) => {
  const { id } = child;
  const planId = id;
  return fetchApi(`/api/v1/floorplans/plans/${planId}/favorite`, {
    method: "PUT",
  });
};

// プラン削除
export const deletePlan = (child: HistoryChildren) => {
  const { id } = child;
  const planId = id;
  return fetchApi(`/api/v1/floorplans/plans/${planId}`, {
    method: "DELETE",
  });
};
