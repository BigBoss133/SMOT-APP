import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "../components/ConfirmDialog";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("ConfirmDialog", () => {
  it("renders with title and message", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Conferma"
        message="Sei sicuro?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByTestId("confirm-dialog-title")).toHaveTextContent("Conferma");
    expect(screen.getByTestId("confirm-dialog-message")).toHaveTextContent("Sei sicuro?");
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Elimina"
        message="Eliminare questo documento?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        confirmLabel="Elimina"
      />
    );
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Elimina"
        message="Eliminare questo documento?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("uses default labels when not provided", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Conferma"
        message="Sei sicuro?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByTestId("confirm-dialog-confirm")).toHaveTextContent("Conferma");
    expect(screen.getByTestId("confirm-dialog-cancel")).toHaveTextContent("Annulla");
  });

  it("renders dialog element", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-dialog").tagName.toLowerCase()).toBe("dialog");
  });
});
