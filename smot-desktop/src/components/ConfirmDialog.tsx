import { memo, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      data-testid="confirm-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
      style={{
        border: "none",
        borderRadius: "16px",
        padding: "24px",
        maxWidth: "420px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "1.15rem",
          fontWeight: 600,
          color: "var(--app-bg-primary, #1a1a2e)",
        }}
        data-testid="confirm-dialog-title"
      >
        {title}
      </h3>
      <p
        style={{
          margin: "0 0 24px 0",
          fontSize: "0.9rem",
          color: "rgba(0,0,0,0.6)",
          lineHeight: 1.5,
        }}
        data-testid="confirm-dialog-message"
      >
        {message}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          className="action-button secondary"
          onClick={onCancel}
          data-testid="confirm-dialog-cancel"
        >
          {cancelLabel}
        </button>
        <button
          className="action-button"
          onClick={() => {
            onConfirm();
          }}
          style={{
            background:
              confirmVariant === "danger"
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : undefined,
          }}
          data-testid="confirm-dialog-confirm"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default memo(ConfirmDialog);
