/**
 * @jest-environment jsdom
 */
import * as nextNavigation from "next/navigation";
import HomePage from "../page";

// Mock setup
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Tests
describe("Home Page", () => {
  it("redirects to /login", () => {
    HomePage();
    expect(nextNavigation.redirect).toHaveBeenCalledWith("/login");
  });
});
