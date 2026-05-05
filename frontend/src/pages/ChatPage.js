import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendQuestion } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

const filters = ['Tutti', 'Lavoro', 'Studio', 'Personale'];

export default function ChatPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations[language];
  const [selectedFilter, setSelectedFilter] = useState('Tutti');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => Boolean(question.trim()) && !loading, [question, loading]);

  const onSubmit = async () => {
    if (!canSend) return;
    const cleanQuestion = question.trim();
    setLoading(true);
    setQuestion('');
    try {
      const response = await sendQuestion(cleanQuestion, selectedFilter);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: cleanQuestion },
        { role: 'assistant', content: response.answer },
      ]);
      setSources(response.sources || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout" data-testid="chat-page">
      <section className="chat-filters" data-testid="chat-filters-sidebar">
        <h2 data-testid="chat-filters-title">Filtri</h2>
        {filters.map((filter) => (
          <button
            key={filter}
            className={`list-item ${selectedFilter === filter ? 'active' : ''}`}
            onClick={() => setSelectedFilter(filter)}
            data-testid={`chat-filter-${filter.toLowerCase()}`}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="chat-main" data-testid="chat-main-panel">
        <h1 data-testid="chat-title">Chat con Documenti</h1>
        <div className="chat-messages" data-testid="chat-messages-list">
          {messages.length ? (
            messages.map((message, index) => (
              <article
                className={`message ${message.role}`}
                key={`${message.role}-${index}`}
                data-testid={`chat-message-${message.role}-${index}`}
              >
                <p className="card-label" data-testid={`chat-message-role-${index}`}>
                  {message.role === 'user' ? 'Tu' : 'SMOT'}
                </p>
                <p data-testid={`chat-message-content-${index}`}>{message.content}</p>
              </article>
            ))
          ) : (
            <p className="card-muted" data-testid="chat-empty-state-message">
              Nessuna domanda inviata. Prova: “Quali sono i termini di pagamento nel contratto?”
            </p>
          )}
        </div>
        <div className="chat-input-row" data-testid="chat-input-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={text.askQuestion}
            data-testid="chat-question-input"
          />
          <button className="action-button" onClick={onSubmit} disabled={!canSend} data-testid="chat-send-button">
            {loading ? '...' : text.send}
          </button>
        </div>
      </section>

      <aside className="chat-sources" data-testid="chat-sources-panel">
        <h2 data-testid="chat-sources-title">{text.sources}</h2>
        {sources.length ? (
          sources.map((source) => (
            <button
              key={`${source.document_id}-${source.page}`}
              className="list-item"
              onClick={() => navigate(`/viewer/${source.document_id}?page=${source.page}`)}
              data-testid={`chat-source-item-${source.document_id}-${source.page}`}
            >
              <p data-testid={`chat-source-name-${source.document_id}`}>{source.document_name}</p>
              <p className="card-muted" data-testid={`chat-source-meta-${source.document_id}`}>
                p.{source.page} • {source.snippet}
              </p>
            </button>
          ))
        ) : (
          <p className="card-muted" data-testid="chat-sources-empty-message">Le fonti appariranno qui.</p>
        )}
      </aside>
    </div>
  );
}
