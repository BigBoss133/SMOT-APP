import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export default function SettingsPage({ modeData, onModeChange }) {
  const { language } = useLanguage();
  const text = translations[language];
  const [autoChunk, setAutoChunk] = useState(true);
  const [resourceGuard, setResourceGuard] = useState(true);

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
            {modeData?.available_modes?.map((mode) => (
              <button
                key={mode}
                className={`mode-chip ${modeData.active_mode === mode ? 'active' : ''}`}
                onClick={() => onModeChange(mode)}
                data-testid={`settings-mode-option-${mode.toLowerCase()}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group" data-testid="settings-options-group">
          <label className="switch-row" data-testid="settings-autochunk-row">
            <span data-testid="settings-autochunk-label">Chunking automatico adattivo</span>
            <input
              type="checkbox"
              checked={autoChunk}
              onChange={() => setAutoChunk((value) => !value)}
              data-testid="settings-autochunk-toggle"
            />
          </label>
          <label className="switch-row" data-testid="settings-resource-guard-row">
            <span data-testid="settings-resource-guard-label">Protezione risorse in low-RAM</span>
            <input
              type="checkbox"
              checked={resourceGuard}
              onChange={() => setResourceGuard((value) => !value)}
              data-testid="settings-resource-guard-toggle"
            />
          </label>
        </div>

        <button className="action-button" data-testid="settings-save-button">
          {text.saveSettings}
        </button>
      </section>
    </div>
  );
}
