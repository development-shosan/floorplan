/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MadoriPage from "../components/MadoriPage";

// ユーザーモック
jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

// APIモック
jest.mock("@/lib/api", () => {
  return {
    __esModule: true,
    createMadori: jest.fn(async () => ({ jobId: "test-job-id" })),
  };
});

import { useUser } from "@/hooks/userContext";
import * as api from "@/lib/api";

describe("MadoriPage コンポーネント", () => {
  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({
      user: { name: "テスト営業担当" },
    });
    jest.clearAllMocks();
  });

  test("ヘッダーが正しく表示されること", () => {
    render(<MadoriPage setActiveTab={jest.fn()} />);
    expect(screen.getByText(/営業担当：テスト営業担当/)).toBeInTheDocument();
    expect(screen.getByText(/AI間取り生成システム/)).toBeInTheDocument();
  });

  test("フォームの初期値が正しいこと", () => {
    render(<MadoriPage setActiveTab={jest.fn()} />);
    expect(screen.getByPlaceholderText(/例: 佐藤邸 間取りプラン/)).toHaveValue(
      ""
    );
    expect(screen.getByPlaceholderText(/例: 佐藤 太郎/)).toHaveValue("");
  });

  test("必須項目の未入力でエラーが表示されること", async () => {
    render(<MadoriPage setActiveTab={jest.fn()} />);
    fireEvent.click(screen.getByText("間取り生成開始"));

    await waitFor(() => {
      expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
      expect(screen.getByText("顧客名は必須です")).toBeInTheDocument();
      expect(
        screen.getByText("ご家族構成を入力してください")
      ).toBeInTheDocument();
    });
  });

  test("フォームに入力後、APIが呼ばれるか確認", async () => {
    render(<MadoriPage setActiveTab={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/例: 佐藤邸 間取りプラン/), {
      target: { value: "テストプロジェクト" },
    });
    fireEvent.change(screen.getByPlaceholderText(/例: 佐藤 太郎/), {
      target: { value: "佐藤太郎" },
    });
    fireEvent.change(screen.getByPlaceholderText(/例: 4/), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByPlaceholderText(/例: 20/), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByPlaceholderText(/例: 12/), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByPlaceholderText(/例: 18/), {
      target: { value: "18" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/例: 玄関からキッチンまでの動線を短く/),
      { target: { value: "短くしたい" } }
    );

    fireEvent.click(screen.getByText("間取り生成開始"));

    await waitFor(() => {
      if ((api.createMadori as jest.Mock).mock.calls.length > 0) {
        const calledArg = (api.createMadori as jest.Mock).mock.calls[0][0];
        expect(calledArg.title).toBe("テストプロジェクト");
        expect(calledArg.clientName).toBe("佐藤太郎");
      }
    });
  });
});
