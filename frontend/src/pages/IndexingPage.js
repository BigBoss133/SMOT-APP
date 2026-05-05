import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  continueInBackground,
  getIndexingStatus,
  pauseIndexing,
  resumeIndexing,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export default function IndexingPage({ onStatusUpdate }) {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { language } = useLanguage();
  const text = translations[language];
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId === 'demo') {
      return;
    }
    const poll = async () => {
      try {
        const response = await getIndexingStatus(jobId);
        setStatus(response);
        onStatusUpdate(response);
      } catch {
        setError('Job non trovato. Avvia un caricamento prima.');
      }
    };

    poll();
    const timer = setInterval(poll, 1200);
    return () => clearInterval(timer);
  }, [jobId, onStatusUpdate]);

  const actionPauseResume = async () => {
    if (!status) return;
    if (status.status === 'paused') {
      await resumeIndexing(jobId);
    } else {
      await pauseIndexing(jobId);
    }
  };

  const actionBackground = async () => {
    await continueInBackground(jobId);
    navigate('/');
  };

  if (jobId === 'demo') {
    return (
      <section className="panel-card" data-testid="indexing-demo-state-card">
        <h1 data-testid="indexing-demo-title">{text.indexingInProgress}</h1>
        <p className="card-muted" data-testid="indexing-demo-description">
          Nessun job attivo. Carica documenti dalla schermata Upload.
        </p>
      </section>
    );
  }

  return (
    <div className="page-grid" data-testid="indexing-page">
      <section className="panel-card" data-testid="indexing-overview-card">
        <h1 data-testid="indexing-title">{text.indexingInProgress}</h1>
        {error ? <p className="error-text" data-testid="indexing-error-message">{error}</p> : null}
        {status ? (
          <>
            <p className="card-muted" data-testid="indexing-overall-progress-text">
              Progresso complessivo: {status.overall_progress}% ({status.completed_documents}/{status.total_documents})
            </p>
            <div className="progress-track" data-testid="indexing-overall-progress-track">
              <div
                className="progress-fill"
                style={{ width: `${status.overall_progress}%` }}
                data-testid="indexing-overall-progress-fill"
              />
            </div>
            <p className="card-muted" data-testid="indexing-overview-meta">
              ETA: {status.eta_seconds}s • Processato {status.processed_kb}/{status.total_kb} KB
            </p>
          </>
        ) : (
          <p className="card-muted" data-testid="indexing-loading-message">Caricamento stato...</p>
        )}
      </section>

      <section className="panel-card" data-testid="indexing-files-card">
        <h2 data-testid="indexing-files-title">Document processing card</h2>
        <div className="list-stack" data-testid="indexing-files-list">
          {status?.files?.map((file) => (
            <article className="list-item static" key={file.document_id} data-testid={`index-file-row-${file.document_id}`}>
              <p data-testid={`index-file-name-${file.document_id}`}>{file.document_name}</p>
              <p className="card-muted" data-testid={`index-file-progress-${file.document_id}`}>
                {file.file_progress}% • Chunk {file.chunk_done}/{file.chunk_total} • Embedding {file.embedding_done}/
                {file.embedding_total}
              </p>
            </article>
          ))}
        </div>
        <div className="action-row" data-testid="indexing-action-row">
          <button className="action-button secondary" onClick={actionPauseResume} data-testid="indexing-pause-resume-button">
            {status?.status === 'paused' ? text.resume : text.pause}
          </button>
          <button className="action-button secondary" onClick={actionBackground} data-testid="indexing-background-button">
            {text.continueBackground}
          </button>
          <button className="action-button" onClick={() => navigate('/chat')} data-testid="indexing-open-chat-button">
            {text.openChat}
          </button>
        </div>
      </section>
    </div>
  );
}
