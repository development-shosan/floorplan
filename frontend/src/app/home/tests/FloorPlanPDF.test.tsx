/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FloorPlanPDF from "../components/FloorPlanPDF";
import { FloorData } from "@/constants/floorPlan";

// --- ダミーデータ ---
const dummyFloorData: FloorData = {
  rooms: [{ name: "リビング", x: 0, y: 0, width: 5, height: 4 }],
  objects: [{ name: "ベッド", x: 1, y: 1, width: 2, height: 1, imageUrl: "" }],
};

describe("FloorPlanPDF テスト", () => {
  test("canvas と floorLabel が正しくレンダリングされるか", () => {
    render(<FloorPlanPDF floorData={dummyFloorData} floorLabel="1階" />);

    // --- Canvas が存在するか確認 ---
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // --- FloorLabel が表示されているか確認 ---
    expect(screen.getByText("1階")).toBeInTheDocument();
  });

  test("floorLabel が無くてもレンダリングされるか", () => {
    render(<FloorPlanPDF floorData={dummyFloorData} />);

    // --- Canvas が存在するかだけチェック ---
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  test("最低限のマウスイベントの発火", () => {
    render(<FloorPlanPDF floorData={dummyFloorData} />);
    const canvas = document.querySelector("canvas")!;

    // --- クリック・ドラッグイベントをシミュレーション ---
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);
  });
});
