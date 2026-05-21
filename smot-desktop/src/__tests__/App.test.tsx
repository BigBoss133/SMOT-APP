import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider } from "../context/ThemeContext";

vi.mock("../services/api", () => ({
  getDocuments: vi.fn(() => Promise.resolve([])),
  getSystemStatus: vi.fn(() => Promise.resolve(null)),
  getModes: vi.fn(() => Promise.resolve({ active_mode: "Balanced", available_modes: ["Performance", "Balanced", "Lite"] })),
  updateMode: vi.fn(() => Promise.resolve({ active_mode: "Balanced", available_modes: ["Performance", "Balanced", "Lite"] })),
}));

const renderWithProviders = (ui: React.ReactElement, initialEntries = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LanguageProvider>
        <ThemeProvider>
          {ui}
        </ThemeProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
};

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app shell with main content area", () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId("smot-app-shell")).toBeInTheDocument();
    expect(screen.getByTestId("main-content-area")).toBeInTheDocument();
  });

  it("shows topbar on non-onboarding pages", () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId("main-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("topbar-search-box")).toBeInTheDocument();
    expect(screen.getByTestId("language-toggle-button")).toBeInTheDocument();
  });

  it("renders status bar when not on onboarding", () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId("smot-app-shell").querySelector(".status-bar")).toBeInTheDocument();
  });

  it("shows sidebar navigation on dashboard", () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId("main-left-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-navdashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-navchat")).toBeInTheDocument();
  });
});
