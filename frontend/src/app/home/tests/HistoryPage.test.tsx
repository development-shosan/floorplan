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
import HistoryPage from "../components/HistoryPage";
import * as api from "@/lib/api";
import { useUser } from "@/hooks/userContext";

jest.mock("@/lib/api", () => ({
  __esModule: true,
  getHistoryList: jest.fn(async () => ({
    histories: [
      {
        id: 1,
        title: "テストタイトル1",
        createdAt: "2025-10-29T10:00:00Z",
        updatedAt: "2025-10-29T12:00:00Z",
        companyName: "テスト会社",
        customerName: "顧客A",
        userName: "担当者A",
        favoriteCount: 2,
      },
      {
        id: 2,
        title: "テストタイトル2",
        createdAt: "2025-10-28T10:00:00Z",
        updatedAt: "2025-10-28T12:00:00Z",
        companyName: "別会社",
        customerName: "顧客B",
        userName: "担当者B",
        favoriteCount: 0,
      },
    ],
  })),
  getHistoryChildren: jest.fn(async () => []),
}));

jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

beforeAll(() => {
  window.alert = jest.fn();
});

describe("HistoryPage コンポーネント", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1", name: "テストユーザー", role: "MEMBER" },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("コンポーネントが正しくレンダリングされ、APIが呼ばれること", async () => {
    await act(async () => {
      render(<HistoryPage setActiveTab={jest.fn()} />);
    });

    await waitFor(() => {
      expect(api.getHistoryList).toHaveBeenCalledWith("user-1");
    });

    await waitFor(() => {
      expect(screen.getByText("テストタイトル1")).toBeInTheDocument();
      expect(screen.getByText("テストタイトル2")).toBeInTheDocument();
    });
  });

  test("検索機能が動作すること", async () => {
    await act(async () => {
      render(<HistoryPage setActiveTab={jest.fn()} />);
    });

    const input = screen.getByPlaceholderText("タイトル、顧客名で検索");
    fireEvent.change(input, { target: { value: "タイトル1" } });

    const searchButton = screen.getByText("検索");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("テストタイトル1")).toBeInTheDocument();
      expect(screen.queryByText("テストタイトル2")).toBeNull();
    });
  });

  test("タブ切り替えでお気に入り表示が変わること", async () => {
    await act(async () => {
      render(<HistoryPage setActiveTab={jest.fn()} />);
    });

    const favoriteButtons = screen.getAllByText("お気に入り");
    fireEvent.click(favoriteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("テストタイトル1")).toBeInTheDocument();
      expect(screen.queryByText("テストタイトル2")).toBeNull();
    });
  });

  test("詳細ボタンをクリックすると HistoryChild が呼ばれること", async () => {
    await act(async () => {
      render(<HistoryPage setActiveTab={jest.fn()} />);
    });

    const detailButtons = await screen.findAllByText("詳細");
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      expect(api.getHistoryChildren).toHaveBeenCalled();
    });
  });
});
