import { useRef, useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { Brain, Download, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";
import { useToast } from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";
import type { ModeData } from "../types";
import { getOllamaStatus, pullModel, checkDiskSpace, type OllamaStatus, type DownloadProgress } from "../services/ollama";

interface SettingsPageProps {
  modeData: ModeData;
  onModeChange: (mode: string) => void;
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`toggle-track${checked ? " toggle-on" : ""}`}
      style={{ border: "none", padding: 0 }}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export default function SettingsPage({ modeData, onModeChange }: SettingsPageProps) {
  const { language } = useLanguage();
  const text = translations[language];
  const toast = useToast();
  const [autoChunk, setAutoChunk] = useState(true);
  const [resourceGuard, setResourceGuard] = useState(true);
  const [saved, setSaved] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    btnRef.current?.classList.add("btn-saved");
    toast.success(text.settingsSaved);
    setTimeout(() => {
      setSaved(false);
      btnRef.current?.classList.remove("btn-saved");
    }, 700);
  };

  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [lowDiskSpace, setLowDiskSpace] = useState(false);

  const availableModels = [
    { id: "llama3.2:3b", name: "Llama 3.2 3B", size: "1.8 GB" },
    { id: "llama3.2:7b", name: "Llama 3.2 7B", size: "4.1 GB" },
    { id: "nomic-embed-text", name: "Nomic Embed Text", size: "274 MB" },
  ];

  const textRef = useRef(text);
  const toastRef = useRef(toast);

  useEffect(() => {
    textRef.current = text;
    toastRef.current = toast;
  }, [text, toast]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const fetchStatus = async () => {
      const status = await getOllamaStatus();
      setOllamaStatus(status);
    };

    const setupListener = async () => {
      unlisten = await listen("model-download-progress", (event) => {
        const progress = event.payload as DownloadProgress;
        setDownloadProgress(progress);
        if (progress.status === "complete") {
          setDownloadingModel(null);
          toastRef.current.success(textRef.current.modelDownloaded);
          void fetchStatus();
        }
      });
    };

    const checkSpace = async () => {
      const hasSpace = await checkDiskSpace(5);
      setLowDiskSpace(!hasSpace);
    };

    void fetchStatus();
    void setupListener();
    void checkSpace();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const handleDownloadModel = async (modelId: string) => {
    if (downloadingModel) return;
    setDownloadingModel(modelId);
    try {
      await pullModel(modelId);
    } catch {
      setDownloadingModel(null);
    }
  };

const isModelInstalled = (modelId: string) => {
    return ollamaStatus?.models.some(m => m.includes(modelId)) ?? false;
  };

  return (
    <div className="page-grid" data-testid="settings-page">
      <section className="panel-card" data-testid="settings-main-card">
        <h1 data-testid="settings-title">{text.settings}</h1>
        <p className="card-muted" data-testid="settings-description">
          Configura modello locale, performance e comportamento indicizzazione.
        </p>

        <div className="settings-group" data-testid="settings-mode-group">
          <p className="card-label" data-testid="settings-mode-label">Modalità hardware</p>
          <div className="mode-chips" data-testid="settings-mode-options">
            {modeData.available_modes.map((mode) => (
              <button
                key={mode}
                className={`mode-chip ${modeData.active_mode === mode ? "active" : ""}`}
                onClick={() => onModeChange(mode)}
                data-testid={`settings-mode-option-${mode.toLowerCase()}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group" data-testid="settings-options-group">
          <div className="switch-row" data-testid="settings-autochunk-row">
            <label htmlFor="toggle-autochunk" data-testid="settings-autochunk-label" style={{ cursor: "pointer" }}>
              Chunking automatico adattivo
            </label>
            <Toggle
              id="toggle-autochunk"
              checked={autoChunk}
              onChange={() => setAutoChunk(v => !v)}
            />
          </div>
          <div className="switch-row" data-testid="settings-resource-guard-row">
            <label htmlFor="toggle-resource" data-testid="settings-resource-guard-label" style={{ cursor: "pointer" }}>
              Protezione risorse in low-RAM
            </label>
            <Toggle
              id="toggle-resource"
              checked={resourceGuard}
              onChange={() => setResourceGuard(v => !v)}
            />
          </div>
        </div>

        <button
          ref={btnRef}
          className="action-button"
          onClick={handleSave}
          data-testid="settings-save-button"
        >
          {saved ? "✓ Salvato" : text.saveSettings}
        </button>
      </section>

      <section className="panel-card" data-testid="model-management-section">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <Brain size={24} style={{ color: "#4338f5" }} />
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--app-bg-primary)" }}>
            {text.modelManagement}
          </h2>
        </div>

        {ollamaStatus && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              background: ollamaStatus.installed ? "#e9ffef" : "#ffebee",
              color: ollamaStatus.installed ? "#107c2f" : "#c62828",
              marginBottom: "20px",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: ollamaStatus.installed ? "#10981a" : "#ef4444",
              }}
            />
            {ollamaStatus.installed ? text.ollamaInstalled : text.ollamaNotInstalled}
          </div>
        )}

        {!ollamaStatus?.installed && (
          <p style={{ color: "rgba(0,0,0,0.6)", fontSize: "0.9rem", marginBottom: "20px" }}>
            {text.installOllama}
          </p>
        )}

        {lowDiskSpace && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              background: "#fff4de",
              borderRadius: "8px",
              marginBottom: "20px",
              color: "#b97100",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={18} />
            {text.diskSpaceWarning}
          </div>
        )}

        {ollamaStatus?.installed && (
          <>
            <h3 style={{ fontSize: "1rem", margin: "0 0 12px 0", color: "var(--app-bg-primary)" }}>
              {text.availableModels}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {availableModels.map((model) => {
                const installed = isModelInstalled(model.id);
                const isDownloading = downloadingModel === model.id;

                return (
                  <div
                    key={model.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "#fafbff",
                      borderRadius: "10px",
                      border: "1px solid #eceffd",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: 600, color: "var(--app-bg-primary)" }}>
                        {model.name}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.5)" }}>
                        {model.size}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {isDownloading && downloadProgress && (
                        <div style={{ width: "120px" }}>
                          <div
                            style={{
                              height: "6px",
                              background: "#eceffd",
                              borderRadius: "9999px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${downloadProgress.percent}%`,
                                background: "linear-gradient(90deg, #4338f5, #894df8)",
                                transition: "width 300ms ease",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.5)" }}>
                            {Math.round(downloadProgress.percent)}%
                          </span>
                        </div>
                      )}

                      {installed ? (
                        <span
                          style={{
                            padding: "6px 12px",
                            background: "#e9ffef",
                            color: "#107c2f",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          ✓
                        </span>
                      ) : isDownloading ? (
                        <span style={{ fontSize: "0.85rem", color: "#4338f5" }}>
                          {text.downloading}
                        </span>
                      ) : (
                        <button
                          onClick={() => void handleDownloadModel(model.id)}
                          disabled={!!downloadingModel || lowDiskSpace}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#ffffff",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: downloadingModel || lowDiskSpace ? "not-allowed" : "pointer",
                            opacity: downloadingModel || lowDiskSpace ? 0.5 : 1,
                          }}
                          type="button"
                        >
                          <Download size={14} />
                          {text.downloadModel}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {ollamaStatus.models.length > 0 && (
              <>
                <h3
                  style={{
                    fontSize: "1rem",
                    margin: "24px 0 12px 0",
                    color: "var(--app-bg-primary)",
                  }}
                >
                  {text.installedModels}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {ollamaStatus.models.map((model) => (
                    <div
                      key={model}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "rgba(67, 56, 245, 0.05)",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ color: "var(--app-bg-primary)" }}>{model}</span>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 10px",
                          background: "transparent",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "6px",
                          color: "#ef4444",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                        type="button"
                        onClick={() => setModelToDelete(model)}
                      >
                        <Trash2 size={14} />
                        {text.deleteModel}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={!!modelToDelete}
        title={text.deleteModel}
        message={text.deleteModelConfirm}
        confirmLabel={text.deleteModel}
        confirmVariant="danger"
        onConfirm={() => {
          setModelToDelete(null);
        }}
        onCancel={() => setModelToDelete(null)}
      />
    </div>
  );
}