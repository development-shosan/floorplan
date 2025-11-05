/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import HistoryDetail from "../components/HistoryDetail";
import { History, HistoryChildren } from "@/constants/history";
import { UserRole } from "@/constants/roles";

// ユーザーモック
jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

import { useUser } from "@/hooks/userContext";

describe("HistoryDetail コンポーネント", () => {
  const history: History = {
    id: 123,
    title: "テストプロジェクト",
    favoriteCount: 2,
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

  const child: HistoryChildren = {
    id: 1,
    historyParentId: 123,
    floorplanData: {
      type: "プランA",
      first_floor_area: 50,
      second_floor_area: 40,
      total_floor_area: 90,
      tag: ["tag1", "tag2"],
      "1": {
        rooms: [
          { name: "玄関", x: 0, y: 0, width: 2, height: 2 },
          { name: "リビング", x: 2, y: 0, width: 5, height: 4 },
        ],
        objects: [
          { name: "ソファ", x: 2, y: 1, width: 2, height: 1 },
          { name: "テーブル", x: 3, y: 2, width: 2, height: 1 },
        ],
      },
      "2": {
        rooms: [
          { name: "寝室", x: 0, y: 0, width: 4, height: 4 },
          { name: "子供部屋", x: 4, y: 0, width: 3, height: 3 },
        ],
        objects: [{ name: "ベッド", x: 1, y: 1, width: 2, height: 1 }],
      },
    },
    isPatternFavorite: true,
    isDownloaded: false,
    pdfPath: "/files/floorplan_sample.pdf",
    constructionName: "サンプル様邸 新築工事",
    scale: "S=1/100",
    drawingFormat: "平面図",
    createdAt: "2023-09-10",
    createdById: 1,
  };

  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1", name: "テストユーザー", role: UserRole.MEMBER },
    });
  });

  test("レンダリングと主要テキストの確認", async () => {
    await act(async () => {
      render(<HistoryDetail history={history} child={child} onBack={onBack} />);
    });

    // ヘッダ表示
    expect(
      screen.getByText(
        `対応ID: #${history.id.toString().padStart(6, "0")} - ${
          history.customerName
        }様`
      )
    ).toBeInTheDocument();

    // 入力内容確認
    expect(screen.getByText(/ご家族構成/i)).toBeInTheDocument();
    expect(screen.getByText(/建物面積/i)).toBeInTheDocument();
    expect(screen.getByText(/LDK希望面積/i)).toBeInTheDocument();
    expect(screen.getByText(/動線のこだわり/i)).toBeInTheDocument();

    // フロア面積
    expect(screen.getByText(/50 m²/)).toBeInTheDocument();
    expect(screen.getByText(/40 m²/)).toBeInTheDocument();
    expect(screen.getByText(/90 m²/)).toBeInTheDocument();

    // プレビューボタン
    expect(screen.getByText("プレビュー")).toBeInTheDocument();
  });

  test("戻るボタンのクリックでonBackが呼ばれる", async () => {
    await act(async () => {
      render(<HistoryDetail history={history} child={child} onBack={onBack} />);
    });

    const backButton = screen.getByText(/生成一覧へ戻る/i);
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test("プレビューボタンのクリックでプレビューモードに切り替わる", async () => {
    await act(async () => {
      render(<HistoryDetail history={history} child={child} onBack={onBack} />);
    });

    const previewButton = screen.getByText("プレビュー");
    fireEvent.click(previewButton);

    // プレビューモードに入ると HistoryPreview 内のテキストが表示される
    expect(screen.getByText(/プレビュー/)).toBeInTheDocument();
  });
});
