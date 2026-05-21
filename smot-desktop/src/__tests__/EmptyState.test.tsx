import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileText } from "lucide-react";
import EmptyState from "../components/EmptyState";

describe("EmptyState", () => {
  it("renders with title and description", () => {
    render(
      <EmptyState
        icon={FileText}
        title="Nessun documento"
        description="Carica il tuo primo documento per iniziare"
      />
    );
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Nessun documento")).toBeInTheDocument();
    expect(screen.getByText("Carica il tuo primo documento per iniziare")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        icon={FileText}
        title="Vuoto"
        description="Descrizione"
      />
    );
    expect(screen.getByTestId("empty-state-icon")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Vuoto"
        description="Descrizione"
        action={{ label: "Carica", onClick }}
      />
    );
    const button = screen.getByTestId("empty-state-action");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not render action button when not provided", () => {
    render(
      <EmptyState
        title="Vuoto"
        description="Descrizione"
      />
    );
    expect(screen.queryByTestId("empty-state-action")).not.toBeInTheDocument();
  });
});
