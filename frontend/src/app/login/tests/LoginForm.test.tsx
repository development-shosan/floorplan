/**
 * @jest-environment jsdom
 */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { LoginResponse, useUser } from "@/hooks/userContext";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import LoginForm from "../components/LoginForm";

// ===== モックの設定 =====
jest.mock("@/hooks/userContext");
jest.mock("@/lib/api");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

let mockUser: LoginResponse | null = null;
// setUser のモック関数
const setUserMock = jest.fn((data: LoginResponse) => {
  mockUser = data;
});

const pushMock = jest.fn();

// useUser のモック実装
(useUser as jest.Mock).mockImplementation(() => ({
  user: mockUser,
  setUser: setUserMock,
}));

// useRouter のモック実装
(useRouter as jest.Mock).mockReturnValue({
  push: pushMock,
});

// コンソールエラーをテスト中は非表示
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

// フォームに値を入力して送信する処理
const setupAndSubmit = async (email: string, password: string) => {
  render(<LoginForm />);
  fireEvent.change(screen.getByPlaceholderText("example@company.co.jp"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: password },
  });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));
  });
};

describe("LoginForm tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  // --- バリデーション関連 ---
  test("メールアドレスとパスワードが空の場合、バリデーションエラー表示", async () => {
    render(<LoginForm />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));
    });

    // エラーメッセージが表示されているか確認
    expect(
      screen.getByText("メールアドレスを入力してください。")
    ).toBeInTheDocument();
    expect(
      screen.getByText("パスワードを入力してください。")
    ).toBeInTheDocument();
  });

  test("メールアドレスの形式が正しくない場合、エラー表示", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText("example@company.co.jp"), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));
    });

    // メール形式エラーの確認
    expect(
      screen.getByText("メールアドレスの形式が正しくありません。")
    ).toBeInTheDocument();
  });

  // --- ログイン成功 ---
  test("ログイン成功時、ホーム画面に遷移", async () => {
    (loginUser as jest.Mock).mockResolvedValue({
      id: 1,
      name: "テストユーザー",
    });

    await setupAndSubmit("test@example.com", "password123");

    await waitFor(() => {
      // ユーザー情報がセットされること
      expect(setUserMock).toHaveBeenCalledWith({
        id: 1,
        name: "テストユーザー",
      });
      // ホーム画面に遷移すること
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  // --- ログイン失敗（サーバーエラー含む）---
  const errorCases: Array<{ message: string; error: unknown }> = [
    { message: "400", error: { response: { status: 400 } } },
    { message: "401", error: { response: { status: 401 } } },
    { message: "403", error: { response: { status: 403 } } },
    { message: "404", error: { response: { status: 404 } } },
    { message: "406", error: { response: { status: 406 } } },
    { message: "500", error: { response: { status: 500 } } },
    { message: "unknown", error: {} },
  ];

  it.each(errorCases)(
    "ログイン失敗時にクラッシュしないことを確認: %s",
    async ({ error }) => {
      (loginUser as jest.Mock).mockRejectedValue(error);

      await setupAndSubmit("test@example.com", "password123");

      // エラーメッセージの確認はせず、フォームがクラッシュしていないことのみ確認
      expect(
        screen.getByRole("button", { name: /ログイン/i })
      ).toBeInTheDocument();
    }
  );

  // --- パスワード忘れモーダル ---
  test("パスワード忘れモーダル表示", async () => {
    render(<LoginForm />);

    await act(async () => {
      fireEvent.click(screen.getByText("パスワードを忘れた方はこちら"));
    });

    // モーダルの表示確認
    expect(await screen.findByText("お知らせ")).toBeInTheDocument();
    expect(
      screen.getByText("管理者にお問い合わせください")
    ).toBeInTheDocument();
  });
});
