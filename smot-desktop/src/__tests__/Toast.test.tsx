import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Toast from "../components/Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders success toast", () => {
    render(
      <Toast
        toast={{ id: "1", message: "Operazione completata", type: "success" }}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText("Operazione completata")).toBeInTheDocument();
    expect(screen.getByTestId("toast-success")).toBeInTheDocument();
  });

  it("renders error toast", () => {
    render(
      <Toast
        toast={{ id: "2", message: "Errore", type: "error" }}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText("Errore")).toBeInTheDocument();
    expect(screen.getByTestId("toast-error")).toBeInTheDocument();
  });

  it("renders warning toast", () => {
    render(
      <Toast
        toast={{ id: "3", message: "Attenzione", type: "warning" }}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText("Attenzione")).toBeInTheDocument();
    expect(screen.getByTestId("toast-warning")).toBeInTheDocument();
  });

  it("renders info toast", () => {
    render(
      <Toast
        toast={{ id: "4", message: "Informazione", type: "info" }}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText("Informazione")).toBeInTheDocument();
    expect(screen.getByTestId("toast-info")).toBeInTheDocument();
  });

  it("dismisses on close button click", () => {
    const onDismiss = vi.fn();
    render(
      <Toast
        toast={{ id: "6", message: "Dismiss me", type: "info" }}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId("toast-dismiss"));
    expect(onDismiss).toHaveBeenCalledWith("6");
  });
});
