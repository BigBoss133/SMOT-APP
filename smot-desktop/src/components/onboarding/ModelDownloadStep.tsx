import { useState } from "react";
import { Download, Brain, Search } from "lucide-react";

interface Model {
  id: string;
  name: string;
  size: string;
  badge: "recommended" | "needed";
  icon: React.ReactNode;
}

interface ModelDownloadStepProps {
  tier: string;
  onSkip: () => void;
  t: {
    modelTitle: string;
    modelRecommended: string;
    modelNeeded: string;
    downloadNow: string;
    downloadBackground: string;
    skipModel: string;
    aiNotSupported: string;
  };
}

const supportsAI = (tier: string) => ["Premium", "Standard"].includes(tier);

const models: Model[] = [
  {
    id: "llama3.2",
    name: "Llama 3.2 3B",
    size: "1.8 GB",
    badge: "recommended",
    icon: <Brain size={20} />,
  },
  {
    id: "nomic",
    name: "Nomic Embed",
    size: "274 MB",
    badge: "needed",
    icon: <Search size={20} />,
  },
];

export function ModelDownloadStep({ tier, onSkip, t }: ModelDownloadStepProps) {
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());
  const [completedModels, setCompletedModels] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handleDownload = (modelId: string) => {
    if (downloadingModels.has(modelId) || completedModels.has(modelId)) return;

    setDownloadingModels((prev) => new Set(prev).add(modelId));

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDownloadingModels((prev) => {
          const next = new Set(prev);
          next.delete(modelId);
          return next;
        });
        setCompletedModels((prev) => new Set(prev).add(modelId));
      }
      setProgress((prev) => ({ ...prev, [modelId]: Math.min(currentProgress, 100) }));
    }, 500);
  };

  const handleDownloadBackground = () => {
    models.forEach((model) => {
      if (!completedModels.has(model.id)) {
        handleDownload(model.id);
      }
    });
  };

  if (!supportsAI(tier)) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{t.modelTitle}</h2>
        <div style={styles.notSupportedCard}>
          <Search size={48} style={{ color: "rgba(255,255,255,0.5)" }} />
          <p style={styles.notSupportedText}>{t.aiNotSupported}</p>
        </div>
        <button onClick={onSkip} style={styles.skipButton} type="button">
          {t.skipModel}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.modelTitle}</h2>

      <div style={styles.modelsList}>
        {models.map((model) => (
          <div key={model.id} style={styles.modelCard}>
            <div style={styles.modelInfo}>
              <span style={styles.modelIcon}>{model.icon}</span>
              <div style={styles.modelDetails}>
                <span style={styles.modelName}>{model.name}</span>
                <span style={styles.modelSize}>{model.size}</span>
              </div>
              <span
                style={{
                  ...styles.modelBadge,
                  ...(model.badge === "recommended" ? styles.badgeRecommended : styles.badgeNeeded),
                }}
              >
                {model.badge === "recommended" ? t.modelRecommended : t.modelNeeded}
              </span>
            </div>

            {downloadingModels.has(model.id) ? (
              <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${progress[model.id] ?? 0}%`,
                    }}
                  />
                </div>
                <span style={styles.progressText}>{Math.round(progress[model.id] ?? 0)}%</span>
              </div>
            ) : completedModels.has(model.id) ? (
              <span style={styles.completedText}>✓ Installato</span>
            ) : (
              <button
                onClick={() => handleDownload(model.id)}
                style={styles.downloadButton}
                type="button"
              >
                <Download size={16} />
                {t.downloadNow}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button onClick={handleDownloadBackground} style={styles.backgroundButton} type="button">
          {t.downloadBackground}
        </button>
        <button onClick={onSkip} style={styles.skipButton} type="button">
          {t.skipModel}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#ffffff",
    textAlign: "center",
  },
  modelsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "450px",
  },
  modelCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
  },
  modelInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  modelIcon: {
    color: "#4338f5",
  },
  modelDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  modelName: {
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  modelSize: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.8rem",
  },
  modelBadge: {
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  badgeRecommended: {
    background: "rgba(67, 56, 245, 0.2)",
    color: "#818cf8",
  },
  badgeNeeded: {
    background: "rgba(188, 196, 28, 0.2)",
    color: "#bcc41c",
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 200ms ease",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  progressBar: {
    flex: 1,
    height: "8px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "9999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4338f5, #894df8)",
    transition: "width 300ms ease",
  },
  progressText: {
    color: "#ffffff",
    fontSize: "0.85rem",
    fontWeight: 600,
    minWidth: "40px",
    textAlign: "right",
  },
  completedText: {
    color: "#10981a",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  backgroundButton: {
    padding: "12px 20px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 200ms ease",
  },
  skipButton: {
    padding: "12px 20px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 200ms ease",
  },
  notSupportedCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "40px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    textAlign: "center",
  },
  notSupportedText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "1rem",
    maxWidth: "300px",
  },
};
