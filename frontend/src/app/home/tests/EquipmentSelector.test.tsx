/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EquipmentSelector from "../components/EquipmentSelector";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

describe("EquipmentSelector テスト", () => {
  const setFloorData = jest.fn();
  const currentFloor: 1 | 2 = 1;

  const dummyImages = [
    { name: "img1_tagA.png", url: "https://example.com/img1.png" },
    { name: "img2_tagB.png", url: "https://example.com/img2.png" },
  ];

  beforeAll(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getEquipmentImages as jest.Mock).mockResolvedValue({
      images: dummyImages,
    });
    (api.deleteEquipmentImage as jest.Mock).mockResolvedValue({});
  });

  it("設備選択コンポーネントが正しくレンダリングされる", async () => {
    render(
      <EquipmentSelector
        setFloorData={setFloorData}
        currentFloor={currentFloor}
      />
    );

    // タイトル確認
    expect(screen.getByText("設備選択")).toBeInTheDocument();

    // API呼び出し確認
    await waitFor(() => expect(api.getEquipmentImages).toHaveBeenCalled());

    // 画像が描画されるかチェック
    for (const img of dummyImages) {
      const alt = img.name.split("_")[1];
      await waitFor(() => expect(screen.getByAltText(alt)).toBeInTheDocument());
    }

    // 配置ボタン確認
    expect(screen.getByText("配置")).toBeInTheDocument();
  });

  it("画像選択後に配置ボタンで setFloorData が呼ばれる", async () => {
    render(
      <EquipmentSelector
        setFloorData={setFloorData}
        currentFloor={currentFloor}
      />
    );

    await waitFor(() => expect(api.getEquipmentImages).toHaveBeenCalled());

    const checkboxes = await screen.findAllByRole("checkbox");

    fireEvent.click(checkboxes[0]);

    // 配置ボタンクリック
    fireEvent.click(screen.getByText("配置"));

    await waitFor(() => expect(setFloorData).toHaveBeenCalled());
  });

  it("削除ボタンで deleteEquipmentImage が呼ばれる", async () => {
    render(
      <EquipmentSelector
        setFloorData={setFloorData}
        currentFloor={currentFloor}
      />
    );

    await waitFor(() => expect(api.getEquipmentImages).toHaveBeenCalled());

    const deleteButtons = await screen.findAllByTitle("削除");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(api.deleteEquipmentImage).toHaveBeenCalled());
  });
});
