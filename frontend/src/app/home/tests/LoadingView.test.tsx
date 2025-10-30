/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import LoadingView from "../components/LoadingView";

jest.mock("@/lib/api", () => ({
  __esModule: true,
  getMadoriStatus: jest.fn(async () => ({
    progress: 50,
    status: "processing",
    estimatedTime: "5分",
  })),
  getMadroriResult: jest.fn(async () => ({
    historyChildren: [{ historyParentId: "parent-1" }],
  })),
  getHistoryList: jest.fn(async () => ({
    histories: [{ id: "parent-1", title: "テスト履歴" }],
  })),
}));

jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

import { useUser } from "@/hooks/userContext";
import * as api from "@/lib/api";

describe("LoadingView コンポーネント", () => {
  const mockSetShowLoading = jest.fn();
  const mockSetComplete = jest.fn();
  const mockSetSelectedHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1", name: "テストユーザー" },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("コンポーネントが正しくレンダリングされること", () => {
    render(
      <LoadingView
        jobId="job-123"
        setShowLoading={mockSetShowLoading}
        setComplete={mockSetComplete}
        setSelectedHistory={mockSetSelectedHistory}
      />
    );

    expect(screen.getByText("間取り生成中...")).toBeInTheDocument();
    expect(
      screen.getByText("あなたのご要望に合わせて複数パターンを作成しています")
    ).toBeInTheDocument();

    expect(screen.getByText(/0\s*%/)).toBeInTheDocument();
  });

  test("API getMadoriStatus が呼ばれること", async () => {
    await act(async () => {
      render(
        <LoadingView
          jobId="job-123"
          setShowLoading={mockSetShowLoading}
          setComplete={mockSetComplete}
          setSelectedHistory={mockSetSelectedHistory}
        />
      );
    });

    await waitFor(() => {
      expect(api.getMadoriStatus).toHaveBeenCalledWith("job-123");
    });
  });

  test("completed 状態で履歴が選択されること", async () => {
    (api.getMadoriStatus as jest.Mock).mockResolvedValueOnce({
      progress: 100,
      status: "completed",
      estimatedTime: "0分",
    });

    await act(async () => {
      render(
        <LoadingView
          jobId="job-123"
          setShowLoading={mockSetShowLoading}
          setComplete={mockSetComplete}
          setSelectedHistory={mockSetSelectedHistory}
        />
      );
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(api.getMadroriResult).toHaveBeenCalledWith("job-123");
      expect(api.getHistoryList).toHaveBeenCalledWith("user-1");
      expect(mockSetSelectedHistory).toHaveBeenCalledWith({
        id: "parent-1",
        title: "テスト履歴",
      });
      expect(mockSetComplete).toHaveBeenCalledWith(true);
      expect(mockSetShowLoading).toHaveBeenCalledWith(false);
    });
  });

  test("failed 状態でアラートが表示され、loading が閉じること", async () => {
    window.alert = jest.fn();

    (api.getMadoriStatus as jest.Mock).mockResolvedValueOnce({
      progress: 100,
      status: "failed",
      estimatedTime: "0分",
    });

    await act(async () => {
      render(
        <LoadingView
          jobId="job-123"
          setShowLoading={mockSetShowLoading}
          setComplete={mockSetComplete}
          setSelectedHistory={mockSetSelectedHistory}
        />
      );
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("間取り再生成に失敗しました");
      expect(mockSetComplete).toHaveBeenCalledWith(false);
      expect(mockSetShowLoading).toHaveBeenCalledWith(false);
    });
  });
});
