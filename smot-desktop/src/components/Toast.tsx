import { memo, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, React.CSSProperties> = {
  success: {
    background: "#e9ffef",
    color: "#107c2f",
    border: "1px solid #b4f0c4",
  },
  error: {
    background: "#ffebee",
    color: "#c62828",
    border: "1px solid #f5c6cb",
  },
  info: {
    background: "#e8f4fd",
    color: "#1565c0",
    border: "1px solid #b8daff",
  },
  warning: {
    background: "#fff4de",
    color: "#b97100",
    border: "1px solid #ffe4b5",
  },
};

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "0.9rem",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        animation: "toast-slide-in 300ms ease",
        ...toastStyles[toast.type],
      }}
      data-testid={`toast-${toast.type}`}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
          opacity: 0.6,
        }}
        data-testid="toast-dismiss"
      >
        ×
      </button>
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default memo(Toast);
