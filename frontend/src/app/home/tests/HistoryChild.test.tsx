/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import HistoryChild from "../components/HistoryChild";
import { History } from "@/constants/history";

// APIモック
jest.mock("@/lib/api", () => ({
  __esModule: true,
  getHistoryChildren: jest.fn(async () => ({
    historyChildren: [
      {
        id: 1,
        historyParentId: 1,
        floorplanData: {
          type: "プランA",
          first_floor_area: 50,
          second_floor_area: 40,
          total_floor_area: 90,
          tag: ["tag1", "tag2"],
        },
        isPatternFavorite: true,
        isDownloaded: false,
        pdfPath: "/files/floorplan_sample.pdf",
        constructionName: "サンプル様邸 新築工事",
        scale: "S=1/100",
        drawingFormat: "平面図",
        createdAt: "2023/09/10",
        createdById: 1,
      },
    ],
  })),
}));

// ユーザーモック
jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

import { useUser } from "@/hooks/userContext";
import * as api from "@/lib/api";

const history: History = {
  id: 1,
  title: "テスト履歴",
  favoriteCount: 1,
  companyId: 100,
  companyName: "テスト会社",
  userId: 200,
  userName: "担当者A",
  customerName: "顧客A",
  createdAt: "2025-10-29T10:00:00Z",
  createdById: 200,
  updatedAt: "2025-10-29T12:00:00Z",
  updatedById: 200,
  conditions: {
    family_composition: { value: "夫婦+子1", unit: "" },
    number_of_floors: { value: "2" },
    frontage: { value: "10", unit: "m" },
    depth: { value: "8", unit: "m" },
    desired_LDK_area: { value: "20", unit: "m²" },
    number_of_rooms: { value: "4", unit: "室" },
    number_of_toilets: { value: "2", unit: "箇所" },
    commitment_flow_lines: { value: "回遊動線", unit: "" },
  },
};

describe("HistoryChild コンポーネント", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1", name: "テストユーザー", role: "MEMBER" },
    });
  });

  test("API呼び出しと履歴子要素の表示", async () => {
    await act(async () => {
      render(<HistoryChild history={history} setActiveTab={jest.fn()} />);
    });

    const planTitle = await screen.findByText("プランA");
    expect(planTitle).toBeInTheDocument();

    expect(api.getHistoryChildren).toHaveBeenCalledWith("user-1", history);
  });
});
