import React from 'react';

export const StatusBar = ({ mode, indexedCount, totalCount }) => {
  return (
    <footer className="status-bar" data-testid="global-status-bar">
      <p data-testid="statusbar-mode">Modalità: {mode}</p>
      <p data-testid="statusbar-documents">
        Documenti indicizzati: {indexedCount}/{totalCount}
      </p>
    </footer>
  );
};
