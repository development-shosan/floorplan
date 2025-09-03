/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { UserRole } from "@/constants/roles";
import { useUser } from "@/hooks/userContext";
import Header from "../components/HeaderForm";
import { useRouter } from "next/navigation";

// Mock setup
jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockLogout = jest.fn();
const mockPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const setup = (role: UserRole, name: string) => {
  (useUser as jest.Mock).mockReturnValue({
    user: { role, name },
    loading: false,
    logout: mockLogout,
  });

  render(<Header />);
};

// Tests
describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("営業担当者(MEMBER)のUIが表示される", () => {
    setup(UserRole.MEMBER, "テストユーザー");

    // タイトル
    expect(screen.getByText("🏠 間取り生成システム")).toBeInTheDocument();

    // メニュー
    expect(screen.getByText("間取り生成")).toBeInTheDocument();
    expect(screen.getByText("対応履歴")).toBeInTheDocument();
    expect(screen.getByText("⭐ お気に入り")).toBeInTheDocument();
    expect(screen.getByText("マイページ")).toBeInTheDocument();

    // 権限表示
    expect(screen.getByText("営業 : テストユーザー")).toBeInTheDocument();
  });

  test("会社管理担当者(COMPANY_ADMIN)のUIが表示される", () => {
    setup(UserRole.COMPANY_ADMIN, "テスト会社担当者");

    // タイトル
    expect(screen.getByText("👥 ユーザー管理")).toBeInTheDocument();

    // メニュー
    expect(screen.getByText("対応履歴")).toBeInTheDocument();
    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();

    // 権限表示
    expect(screen.getByText("管理者 : テスト会社担当者")).toBeInTheDocument();
  });

  test("システム管理者(SYSTEM_ADMIN)のUIが表示される", () => {
    setup(UserRole.SYSTEM_ADMIN, "テストシステム担当者");

    // タイトル
    expect(screen.getByText("👥 会社管理")).toBeInTheDocument();

    // メニュー
    expect(screen.getByText("対応履歴")).toBeInTheDocument();
    expect(screen.getByText("会社管理")).toBeInTheDocument();

    // 権限表示
    expect(
      screen.getByText("管理者 : テストシステム担当者")
    ).toBeInTheDocument();
  });

  test("ログアウトボタン呼び出し可能", () => {
    setup(UserRole.MEMBER, "テストユーザー");

    const logoutBtn = screen.getByRole("button", { name: /ログアウト/i });
    logoutBtn.click();

    expect(mockLogout).toHaveBeenCalled();
  });

  test("loading中はロード中メッセージ表示", () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      logout: mockLogout,
    });

    render(<Header />);

    expect(screen.getByText("ロード中...")).toBeInTheDocument();
  });
});
