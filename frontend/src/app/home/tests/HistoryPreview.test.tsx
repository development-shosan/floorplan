/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HistoryPreview from "../components/HistoryPreview";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";

// --- モック設定 ---
jest.mock("@/hooks/userContext");

jest.mock("../components/FloorPlanPDF", () => ({
  __esModule: true,
  default: ({ floorLabel }: { floorLabel: string }) => (
    <div data-testid={`floorplan-${floorLabel}`}>{floorLabel}</div>
  ),
}));

jest.mock("../components/LoadingView", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-view">LoadingView</div>,
}));

// --- ダミーデータ ---
const floorPlanData = {
  first_floor_area: 120.5,
  second_floor_area: 95.3,
  total_floor_area: 215.8,
  tag: ["南向きLDK", "独立キッチン", "和室あり"],
  type: "リビングが広いプラン",
  "1": {
    rooms: [{ name: "リビング", x: 0, y: 0, width: 5, height: 4 }],
    objects: [{ name: "ソファ", x: 1, y: 1, width: 2, height: 1 }],
  },
  "2": {
    rooms: [{ name: "寝室", x: 0, y: 0, width: 3, height: 3 }],
    objects: [{ name: "ベッド", x: 0, y: 0, width: 2, height: 1 }],
  },
};

const dummyHistories = [
  {
    id: 1,
    title: "タイトル1",
    favoriteCount: 1,
    companyId: 1,
    companyName: "会社1",
    userId: 1,
    userName: "担当者1",
    customerName: "顧客1",
    createdAt: "2025-01-01 09:00",
    createdById: 1,
    updatedAt: "2025-01-01 09:00",
    updatedById: 1,
    conditions: {
      family_composition: { value: "4", unit: "people" },
      number_of_floors: { value: "2" },
      frontage: { value: "20", unit: "m" },
      depth: { value: "12", unit: "m" },
      desired_LDK_area: { value: "18", unit: "tatami" },
      number_of_rooms: { value: "3", unit: "rooms" },
      number_of_toilets: { value: "2", unit: "units" },
      commitment_flow_lines: {
        value: "玄関からキッチンまで動線を短く",
        unit: "text",
      },
    },
  },
];

const dummyHistoryChildren = [
  {
    id: 1,
    historyParentId: 1,
    floorplanData: floorPlanData,
    isPatternFavorite: true,
    isDownloaded: false,
    pdfPath: "/files/sample.pdf",
    constructionName: "サンプル邸",
    scale: "S=1/100",
    drawingFormat: "平面図",
    createdAt: "2023-09-10",
    createdById: 1,
  },
];

describe("HistoryPreview 最小UIテスト", () => {
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1", name: "テストユーザー", role: UserRole.MEMBER },
    });
  });

  test("UIが正しくレンダリングされるか", () => {
    render(
      <HistoryPreview
        history={dummyHistories[0]}
        child={dummyHistoryChildren[0]}
        floorplanData={floorPlanData}
        onBack={onBack}
      />
    );

    // --- UI要素の存在チェック ---
    expect(screen.getByText("プレビュー")).toBeInTheDocument();
    expect(screen.getByText("PDFダウンロード")).toBeInTheDocument();
    expect(screen.getByText("印刷")).toBeInTheDocument();
    expect(screen.getByText("戻る")).toBeInTheDocument();
  });

  test("戻るボタンがクリックされるか", () => {
    render(
      <HistoryPreview
        history={dummyHistories[0]}
        child={dummyHistoryChildren[0]}
        floorplanData={floorPlanData}
        onBack={onBack}
      />
    );

    // --- 戻るボタンのクリックイベント ---
    fireEvent.click(screen.getByText("戻る"));
    expect(onBack).toHaveBeenCalled();
  });
});
