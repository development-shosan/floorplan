/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserRole } from "@/constants/roles";
import HeaderForm from "../components/HeaderForm";

describe("HeaderForm コンポーネント", () => {
  const mockLogout = jest.fn();
  const mockSetActiveTab = jest.fn();
  const mockOnTabReset = jest.fn();

  const mockUser = {
    id: 1,
    name: "田中太郎",
    role: UserRole.SYSTEM_ADMIN,
    token: "dummy_token",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("ロード中の場合、「ロード中...」と表示される", () => {
    render(
      <HeaderForm
        user={mockUser}
        loading={true}
        logout={mockLogout}
        activeTab=""
        setActiveTab={mockSetActiveTab}
      />
    );
    expect(screen.getByText("ロード中...")).toBeInTheDocument();
  });

  // ユーザー名が正しく表示される
  it("ユーザー名が正しく表示される", () => {
    render(
      <HeaderForm
        user={mockUser}
        loading={false}
        logout={mockLogout}
        activeTab=""
        setActiveTab={mockSetActiveTab}
      />
    );
    expect(screen.getByText("田中太郎")).toBeInTheDocument();
  });

  // タブクリックで setActiveTab が呼ばれる
  it("メニュータブをクリックすると setActiveTab が呼ばれる", () => {
    render(
      <HeaderForm
        user={mockUser}
        loading={false}
        logout={mockLogout}
        activeTab=""
        setActiveTab={mockSetActiveTab}
      />
    );

    // 管理者用メニューには「会社管理」などが表示される
    const tabButton = screen.getByText("会社管理");
    fireEvent.click(tabButton);

    expect(mockSetActiveTab).toHaveBeenCalledWith("会社管理");
  });

  // 同じタブをもう一度クリックすると onTabReset が呼ばれる
  it("同じタブを再クリックすると onTabReset が呼ばれる", () => {
    render(
      <HeaderForm
        user={mockUser}
        loading={false}
        logout={mockLogout}
        activeTab="会社管理"
        setActiveTab={mockSetActiveTab}
        onTabReset={mockOnTabReset}
      />
    );

    const tabButton = screen.getByText("会社管理");
    fireEvent.click(tabButton);

    expect(mockOnTabReset).toHaveBeenCalledWith("会社管理");
  });

  // メニューボタンをクリックするとドロップダウンが表示される
  it("ユーザーアイコンをクリックするとドロップダウンメニューが表示される", () => {
    render(
      <HeaderForm
        user={mockUser}
        loading={false}
        logout={mockLogout}
        activeTab=""
        setActiveTab={mockSetActiveTab}
      />
    );

    // 初期状態ではログアウトボタンは存在しない
    expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();

    // アイコン（ユーザー名）をクリック
    fireEvent.click(screen.getByText("田中太郎"));

    // ログアウトボタンが表示されることを確認
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });

  // ログアウトボタンがクリックされると logout が呼ばれる
  it("「ログアウト」ボタンをクリックすると logout 関数が呼ばれる", () => {
    render(
      <HeaderForm
        user={mockUser}
        loading={false}
        logout={mockLogout}
        activeTab=""
        setActiveTab={mockSetActiveTab}
      />
    );

    // ドロップダウンを開く
    fireEvent.click(screen.getByText("田中太郎"));

    // ログアウトボタンをクリック
    fireEvent.click(screen.getByText("ログアウト"));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
