import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardwareModeSelector } from '../components/HardwareModeSelector';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export default function DashboardPage({ documents, modeData, onModeChange }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations[language];
  const indexedCount = documents.filter((doc) => doc.indexed).length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.size_kb, 0) / 1024;

  return (
    <div className="page-grid" data-testid="dashboard-page">
      <section className="hero-panel" data-testid="dashboard-hero-panel">
        <h1 data-testid="dashboard-title">{text.welcomeTitle}</h1>
        <p data-testid="dashboard-subtitle">{text.welcomeSubtitle}</p>
        <div className="stats-grid" data-testid="dashboard-stats-grid">
          <article className="stat-card" data-testid="stat-total-documents">
            <p className="card-label">Documenti totali</p>
            <p className="card-value">{documents.length}</p>
          </article>
          <article className="stat-card" data-testid="stat-indexed-documents">
            <p className="card-label">Indicizzati</p>
            <p className="card-value">{indexedCount}</p>
          </article>
          <article className="stat-card" data-testid="stat-total-storage">
            <p className="card-label">Spazio totale</p>
            <p className="card-value">{totalSize.toFixed(2)} GB</p>
          </article>
        </div>
      </section>

      <section className="panel-card" data-testid="dashboard-quick-actions-card">
        <h2 data-testid="quick-actions-title">{text.quickActions}</h2>
        <div className="action-row">
          <button
            className="action-button"
            onClick={() => navigate('/upload')}
            data-testid="quick-action-upload-button"
          >
            {text.uploadDocuments}
          </button>
          <button
            className="action-button secondary"
            onClick={() => navigate('/chat')}
            data-testid="quick-action-chat-button"
          >
            {text.openChat}
          </button>
          <button
            className="action-button secondary"
            onClick={() => navigate('/settings')}
            data-testid="quick-action-settings-button"
          >
            {text.checkSystem}
          </button>
        </div>
      </section>

      <HardwareModeSelector modeData={modeData} onChange={onModeChange} />

      <section className="panel-card" data-testid="dashboard-recent-documents-card">
        <h2 data-testid="recent-documents-title">{text.recentDocuments}</h2>
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
              <span className={doc.indexed ? 'tag-success' : 'tag-warning'} data-testid={`recent-document-status-${doc.id}`}>
                {doc.indexed ? 'Indicizzato' : 'In attesa'}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
