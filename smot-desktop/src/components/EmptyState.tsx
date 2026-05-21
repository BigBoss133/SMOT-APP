import { memo } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: "16px",
      }}
      data-testid="empty-state"
    >
      {Icon && (
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "rgba(67, 56, 245, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4338f5",
          }}
          aria-hidden="true"
          data-testid="empty-state-icon"
        >
          <Icon size={28} />
        </div>
      )}
      <h3
        style={{
          margin: 0,
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--app-bg-primary, #1a1a2e)",
        }}
        data-testid="empty-state-title"
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "0.9rem",
          color: "rgba(0,0,0,0.5)",
          maxWidth: "320px",
        }}
        data-testid="empty-state-description"
      >
        {description}
      </p>
      {action && (
        <button
          className="action-button"
          onClick={action.onClick}
          aria-label={action.label}
          data-testid="empty-state-action"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default memo(EmptyState);
