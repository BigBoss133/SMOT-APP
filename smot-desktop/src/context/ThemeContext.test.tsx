import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";


const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-btn">Toggle Theme</button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("provides default theme 'dark'", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });

  it("loads theme from localStorage if available", () => {
    localStorage.setItem("smot-theme", "light");
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
  });

  it("toggles theme and updates localStorage", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });

    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(localStorage.getItem("smot-theme")).toBe("light");

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(localStorage.getItem("smot-theme")).toBe("dark");
  });
});

  it("handles localStorage errors gracefully", () => {
    // Mock localStorage to throw an error
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;

    Storage.prototype.getItem = vi.fn(() => {
      throw new Error("Access denied");
    });

    Storage.prototype.setItem = vi.fn(() => {
      throw new Error("Quota exceeded");
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should fallback to default 'dark' theme when getItem throws
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });

    // Should toggle theme and handle setItem error gracefully
    expect(screen.getByTestId("theme-value").textContent).toBe("light");

    // Restore original implementation
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
  });

  it("throws error when useTheme is used outside of ThemeProvider", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow("useTheme must be used inside ThemeProvider");

    console.error = originalError;
  });
