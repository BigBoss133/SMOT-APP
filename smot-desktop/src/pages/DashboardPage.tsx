import { useEffect, useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { HardwareModeSelector } from "../components/HardwareModeSelector";
import { useStaggerAnimation } from "../hooks/useAnimation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import type { ModeData, ViewerDocument } from "../types";

interface DashboardPageProps {
  documents: ViewerDocument[];
  modeData: ModeData;
  onModeChange: (mode: string) => void;
}

function DashboardPage({
  documents, modeData, onModeChange,
}: DashboardPageProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations[language];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ⚡ Bolt: Memoize heavy array operations to prevent recalculation during 5s polling interval
  const indexedCount = useMemo(() => documents.filter((doc) => doc.indexed).length, [documents]);
  const totalSize = useMemo(() => documents.reduce((sum, doc) => sum + doc.size_kb, 0) / 1024, [documents]);

  const stats = useMemo(() => [
    { label: "Documenti totali", value: String(documents.length), testId: "stat-total-documents" },
    { label: "Indicizzati",      value: String(indexedCount),      testId: "stat-indexed-documents" },
    { label: "Spazio totale",    value: `${totalSize.toFixed(2)} GB`, testId: "stat-total-storage" },
  ], [documents.length, indexedCount, totalSize]);
  const visible = useStaggerAnimation(stats.length, 120);

  return (
    <div className="page-grid" data-testid="dashboard-page">
      <section className="hero-panel" data-testid="dashboard-hero-panel">
        <h1 data-testid="dashboard-title">{text.welcomeTitle}</h1>
        <p data-testid="dashboard-subtitle">{text.welcomeSubtitle}</p>
        <div className="stats-grid" data-testid="dashboard-stats-grid">
          {stats.map((s, i) => (
            <article
              key={s.testId}
              className={`stat-card${visible[i] ? " anim-visible" : ""}`}
              data-testid={s.testId}
            >
              <p className="card-label">{s.label}</p>
              <p className="card-value">{s.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card" data-testid="dashboard-quick-actions-card">
        <h2 data-testid="quick-actions-title">{text.quickActions}</h2>
        <div className="action-row">
          <button
            className="action-button quick-action"
            onClick={() => navigate("/upload")}
            data-testid="quick-action-upload-button"
          >
            {text.uploadDocuments}
          </button>
          <button
            className="action-button secondary quick-action"
            onClick={() => navigate("/chat")}
            data-testid="quick-action-chat-button"
          >
            {text.openChat}
          </button>
          <button
            className="action-button secondary quick-action"
            onClick={() => navigate("/graph")}
            data-testid="quick-action-graph-button"
          >
            Graph View
          </button>
          <button
            className="action-button secondary quick-action"
            onClick={() => navigate("/settings")}
            data-testid="quick-action-settings-button"
          >
            {text.checkSystem}
          </button>
        </div>
      </section>

      <HardwareModeSelector modeData={modeData} onChange={onModeChange} />

      <section className="panel-card" data-testid="dashboard-recent-documents-card">
        <h2 data-testid="recent-documents-title">{text.recentDocuments}</h2>
        {isLoading ? (
          <div style={{ padding: "16px 0" }} data-testid="dashboard-skeleton">
            <Skeleton count={4} height={48} variant="rect" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={text.noDocumentsTitle}
            description={text.noDocumentsDescription}
            action={{
              label: text.uploadDocuments,
              onClick: () => navigate("/upload"),
            }}
          />
        ) : (
          <div className="list-stack" data-testid="recent-documents-list">
            {documents.slice(0, 5).map((doc) => (
              <button
                className="list-item"
                key={doc.id}
                onClick={() => navigate(`/viewer/${doc.id}`)}
                data-testid={`recent-document-item-${doc.id}`}
              >
                <div>
                  <p data-testid={`recent-document-name-${doc.id}`}>{doc.name}</p>
                  <p className="card-muted" data-testid={`recent-document-meta-${doc.id}`}>
                    {doc.file_type} • {doc.category}
                  </p>
                </div>
                <span
                  className={doc.indexed ? "tag-success" : "tag-warning"}
                  data-testid={`recent-document-status-${doc.id}`}
                >
                  {doc.indexed ? "Indicizzato" : "In attesa"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
// ⚡ Bolt: Memoize the entire component to prevent re-renders cascading from App.tsx system status polling
export default memo(DashboardPage);
