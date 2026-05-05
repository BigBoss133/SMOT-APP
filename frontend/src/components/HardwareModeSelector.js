import React from 'react';

export const HardwareModeSelector = ({ modeData, onChange }) => {
  return (
    <section className="panel-card" data-testid="hardware-mode-selector-card">
      <p className="card-label" data-testid="hardware-mode-label">Modalità hardware</p>
      <div className="mode-chips" data-testid="hardware-mode-options">
        {modeData?.available_modes?.map((mode) => (
          <button
            key={mode}
            className={`mode-chip ${modeData.active_mode === mode ? 'active' : ''}`}
            onClick={() => onChange(mode)}
            data-testid={`hardware-mode-option-${mode.toLowerCase()}`}
          >
            {mode}
          </button>
        ))}
      </div>
    </section>
  );
};
