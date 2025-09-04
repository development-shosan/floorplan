/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useUser } from "@/hooks/userContext";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import LoginForm from "../components/LoginForm";

// Mock
jest.mock("@/hooks/userContext");
jest.mock("@/lib/api");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const setUserMock = jest.fn();
const pushMock = jest.fn();

(useUser as jest.Mock).mockReturnValue({
  user: null,
  setUser: setUserMock,
});

(useRouter as jest.Mock).mockReturnValue({
  push: pushMock,
});

const setupAndSubmit = async (email: string, password: string) => {
  render(<LoginForm />);
  fireEvent.change(screen.getByPlaceholderText("example@company.co.jp"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));
};

describe("LoginForm tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("メールアドレスとパスワードが空の場合、バリデーションエラー表示", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

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
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

    expect(
      screen.getByText("メールアドレスの形式が正しくありません。")
    ).toBeInTheDocument();
  });

  test("ログイン成功時、 ホーム画面に遷移", async () => {
    (loginUser as jest.Mock).mockResolvedValue({
      id: 1,
      name: "テストユーザー",
    });

    await setupAndSubmit("test@example.com", "password123");

    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalledWith({
        id: 1,
        name: "テストユーザー",
      });
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  // エラーケース
  const errorCases: [string, number][] = [
    ["⚠️ エラー: 不正なリクエスト (400)", 400],
    ["⚠️ エラー: 認証に失敗しました (401)", 401],
    ["⚠️ エラー: アクセスが禁止されています (403)", 403],
    ["⚠️ エラー: リソースが見つかりません (404)", 404],
    ["⚠️ エラー: サーバー内部エラー (500)", 500],
    ["⚠️ エラー: 不明なエラーが発生しました", 999],
  ];

  test.each(errorCases)(
    "ログイン失敗時に適切なエラーメッセージ表示",
    async (expectedMessage, code) => {
      let error: Error;

      if (code === 401) {
        error = new Error(
          "⚠️ エラー: メールアドレスまたはパスワードが正しくありません (401)"
        );
      } else if (code === 999) {
        error = {} as Error;
      } else {
        error = new Error(`${expectedMessage}`);
      }

      (loginUser as jest.Mock).mockRejectedValue(error);

      await setupAndSubmit("test@example.com", "password123");

      await waitFor(() => {
        expect(
          screen.getByText(
            expectedMessage.includes("(401)")
              ? "⚠️ エラー: メールアドレスまたはパスワードが正しくありません (401)"
              : `${expectedMessage}`
          )
        ).toBeInTheDocument();
      });
    }
  );

  test("パスワード忘れモーダル表示", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText("パスワードを忘れた方はこちら"));

    expect(await screen.findByText("お知らせ")).toBeInTheDocument();
    expect(
      screen.getByText("管理者にお問い合わせください")
    ).toBeInTheDocument();
  });
});
