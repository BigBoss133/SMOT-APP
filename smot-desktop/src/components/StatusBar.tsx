interface StatusBarProps {
  mode: string;
  indexedCount: number;
  totalCount: number;
  isIndexing?: boolean;
}

function getModeClass(mode: string): string {
  const lower = mode.toLowerCase();
  if (lower === "performance") return "mode-performance";
  if (lower === "lite") return "mode-lite";
  return "mode-balanced";
}

export const StatusBar = ({
  mode, indexedCount, totalCount, isIndexing = false,
}: StatusBarProps) => {
  const dotClass = isIndexing ? "indexing" : indexedCount > 0 ? "active" : "idle";

  return (
    <footer
      className="status-bar"
      style={{ display: "flex", alignItems: "center", gap: 16 }}
      data-testid="global-status-bar"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className={`status-dot ${dotClass}`} />
        <span className={`mode-badge ${getModeClass(mode)}`} data-testid="statusbar-mode">
          {mode}
        </span>
      </div>
      <p data-testid="statusbar-documents" style={{ margin: 0 }}>
        Indicizzati: {indexedCount}/{totalCount}
      </p>
      <span className={`ai-badge ${indexedCount > 0 ? "ready" : "offline"}`}>
        AI {indexedCount > 0 ? "pronto" : "offline"}
      </span>
    </footer>
  );
};
