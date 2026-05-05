import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getDocuments, getViewerPage } from '../services/api';

const highlightText = (text, highlights) => {
  if (!highlights.length) return text;
  const escaped = highlights.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const lowerHighlights = highlights.map((term) => term.toLowerCase());
  return text.split(pattern).map((part, index) => {
    const isMatch = lowerHighlights.includes(part.toLowerCase());
    return isMatch ? <mark key={`${part}-${index}`}>{part}</mark> : <span key={`${part}-${index}`}>{part}</span>;
  });
};

export default function ViewerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { documentId } = useParams();
  const [viewerData, setViewerData] = useState(null);
  const [docList, setDocList] = useState([]);

  const currentDocId = useMemo(() => {
    if (documentId) return documentId;
    return docList[0]?.id;
  }, [documentId, docList]);

  const currentPage = useMemo(() => {
    const page = Number(new URLSearchParams(location.search).get('page') || 1);
    return Number.isNaN(page) ? 1 : page;
  }, [location.search]);

  useEffect(() => {
    getDocuments().then(setDocList);
  }, []);

  useEffect(() => {
    if (!currentDocId) return;
    getViewerPage(currentDocId, currentPage).then(setViewerData);
  }, [currentDocId, currentPage]);

  const goPage = (nextPage) => {
    navigate(`/viewer/${currentDocId}?page=${nextPage}`);
  };

  return (
    <section className="page-grid" data-testid="viewer-page">
      <article className="panel-card" data-testid="viewer-main-card">
        <div className="viewer-head" data-testid="viewer-header">
          <h1 data-testid="viewer-document-title">{viewerData?.document_name ?? 'Document Viewer'}</h1>
          <p className="card-muted" data-testid="viewer-page-counter">
            Pagina {viewerData?.page ?? 0}/{viewerData?.total_pages ?? 0}
          </p>
        </div>
        <div className="viewer-text" data-testid="viewer-document-text">
          {viewerData ? highlightText(viewerData.text, viewerData.highlights) : 'Caricamento documento...'}
        </div>
        <div className="action-row" data-testid="viewer-navigation-row">
          <button
            className="action-button secondary"
            onClick={() => goPage(Math.max(1, currentPage - 1))}
            data-testid="viewer-prev-page-button"
          >
            Pagina precedente
          </button>
          <button
            className="action-button secondary"
            onClick={() => goPage(Math.min(viewerData?.total_pages ?? 1, currentPage + 1))}
            data-testid="viewer-next-page-button"
          >
            Pagina successiva
          </button>
        </div>
      </article>

      <article className="panel-card" data-testid="viewer-highlight-card">
        <h2 data-testid="viewer-highlight-title">Parole chiave evidenziate</h2>
        <div className="chip-wrap" data-testid="viewer-highlight-list">
          {viewerData?.highlights?.map((term) => (
            <span className="keyword-chip" key={term} data-testid={`viewer-highlight-item-${term}`}>
              {term}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
