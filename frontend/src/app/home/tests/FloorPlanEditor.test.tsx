/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import FloorPlanEditor from "../components/FloorPlanEditor";
import { UserRole } from "@/constants/roles";
import * as userContext from "@/hooks/userContext";

jest.mock("@/hooks/userContext", () => ({
  useUser: jest.fn(),
}));

describe("FloorPlanEditor テスト", () => {
  const dummyFloorData = {
    1: {
      rooms: [{ name: "部屋1", x: 0, y: 0, width: 2, height: 2 }],
      objects: [{ name: "机", x: 0, y: 0, width: 1, height: 1 }],
    },
  };

  beforeEach(() => {
    (userContext.useUser as jest.Mock).mockReturnValue({
      user: {
        id: 1,
        name: "テストユーザー",
        role: UserRole.MEMBER,
        token: "dummy-token",
      },
      loading: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });
  });

  it("Canvas とフロア切替ボタンが存在するか", () => {
    render(
      <FloorPlanEditor
        originalData={dummyFloorData}
        currentFloor={1}
        setCurrentFloor={jest.fn()}
        editable={true}
      />
    );
    expect(screen.getByText("1階")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1階/ })).toBeInTheDocument();
    expect(document.querySelector("canvas")).toBeInTheDocument();
  });
});
