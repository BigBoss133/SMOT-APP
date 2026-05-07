import { useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";
import type { ModeData } from "../types";

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
  const [autoChunk, setAutoChunk] = useState(true);
  const [resourceGuard, setResourceGuard] = useState(true);
  const [saved, setSaved] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleSave = () => {
    setSaved(true);
    btnRef.current?.classList.add("btn-saved");
    setTimeout(() => {
      setSaved(false);
      btnRef.current?.classList.remove("btn-saved");
    }, 700);
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
    </div>
  );
}
