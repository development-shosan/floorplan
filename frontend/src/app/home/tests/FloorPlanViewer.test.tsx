/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import FloorPlanViewer from "../components/FloorPlanViewer";
import { FloorData } from "@/constants/floorPlan";

// ダミーデータ
const dummyData = {
  1: {
    rooms: [{ name: "リビング", x: 0, y: 0, width: 5, height: 4 }],
    objects: [],
  } as FloorData,
  2: {
    rooms: [],
    objects: [{ name: "ベッド", x: 0, y: 0, width: 2, height: 1 }],
  } as FloorData,
};

describe("FloorPlanViewer テスト", () => {
  test("canvas が正しくレンダリングされるか", () => {
    render(<FloorPlanViewer originalData={dummyData} />);
    // --- canvas が存在するかチェック ---
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  test("originalData がない場合もレンダリングされる", () => {
    render(
      <FloorPlanViewer originalData={{ 1: { rooms: [], objects: [] } }} />
    );
    // --- canvas が存在するかチェック ---
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  test("マウスイベントの発火（ドラッグやクリック）", () => {
    render(<FloorPlanViewer originalData={dummyData} />);
    const canvas = document.querySelector("canvas")!;
    // --- 最低限のクリック・ドラッグをシミュレート ---
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);
  });
});
