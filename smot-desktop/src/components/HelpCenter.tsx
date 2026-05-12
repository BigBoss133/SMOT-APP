import { useMemo, useState } from "react";
import { Search, X, BookOpen, Cpu, Key, MessageSquare, Settings, HelpCircle, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface HelpArticle {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  keywords: string[];
}

interface HelpCenterProps {
  onClose: () => void;
}

const articles: Record<string, HelpArticle[]> = {
  it: [
    {
      id: "upload",
      title: "Come caricare un documento",
      icon: <BookOpen size={18} />,
      content: "Trascina un file PDF, DOCX o TXT nell'area di upload, oppure clicca 'Scegli file' per selezionarlo. SMOT supporta upload multipli. Dopo il caricamento, il documento apparirà nella Dashboard.",
      keywords: ["caricare", "upload", "documento", "file", "pdf", "docx"],
    },
    {
      id: "search",
      title: "Come fare una ricerca",
      icon: <Search size={18} />,
      content: "Usa la barra di ricerca in alto per cercare parole chiave nei tuoi documenti. SMOT cerca nel testo completo dei documenti indicizzati e mostra estratti con le parole trovate evidenziate.",
      keywords: ["ricerca", "cercare", "trovare", "full-text", "fts5"],
    },
    {
      id: "chat",
      title: "Come usare la chat IA",
      icon: <MessageSquare size={18} />,
      content: "La chat RAG ti permette di fare domande in linguaggio naturale. SMOT cerca nei tuoi documenti e restituisce risposte basate sul contenuto reale. L'IA è opzionale: senza Ollama, la chat funziona in modalità solo ricerca.",
      keywords: ["chat", "ia", "ai", "ollama", "domanda", "rag"],
    },
    {
      id: "indexing",
      title: "Cos'è l'indicizzazione",
      icon: <Cpu size={18} />,
      content: "L'indicizzazione prepara i documenti per la ricerca. SMOT estrae il testo, lo divide in chunk, e lo salva nel database. I documenti indicizzati sono contrassegnati con un flag verde nella Dashboard.",
      keywords: ["indicizzazione", "indexing", "chunk", "processare"],
    },
    {
      id: "license",
      title: "Come attivare la licenza",
      icon: <Key size={18} />,
      content: "Inserisci la chiave ricevuta via email nel formato SMOT-PREMIUM-XXXX-XXXX-XXXX. Puoi attivarla durante l'onboarding o nelle Impostazioni. La prova gratuita di 7 giorni non richiede alcuna carta.",
      keywords: ["licenza", "license", "chiave", "key", "attivare", "trial"],
    },
    {
      id: "settings",
      title: "Personalizzare SMOT",
      icon: <Settings size={18} />,
      content: "Nelle Impostazioni puoi cambiare la lingua (IT/EN), selezionare la modalità hardware (Performance/Balanced/Lite), e gestire i modelli IA. Le modifiche vengono salvate automaticamente.",
      keywords: ["impostazioni", "settings", "lingua", "modalità", "configurazione"],
    },
    {
      id: "privacy",
      title: "I miei dati sono al sicuro?",
      icon: <HelpCircle size={18} />,
      content: "Assolutamente sì. SMOT funziona completamente offline, senza cloud, senza telemetria. Tutti i tuoi documenti rimangono sul tuo computer. L'IA opzionale (Ollama) è anch'essa locale. Zero dati inviati a server esterni.",
      keywords: ["privacy", "sicuro", "dati", "offline", "cloud", "telemetria"],
    },
    {
      id: "troubleshoot",
      title: "Risoluzione problemi",
      icon: <HelpCircle size={18} />,
      content: "Se l'app non si avvia: verifica che abbia i permessi necessari. Se l'upload fallisce: controlla che il file non sia danneggiato. Se la chat non risponde: verifica che Ollama sia in esecuzione (se usi l'IA). Per assistenza, apri una issue su GitHub.",
      keywords: ["problemi", "errore", "troubleshoot", "non funziona", "crash"],
    },
  ],
  en: [
    {
      id: "upload",
      title: "How to upload a document",
      icon: <BookOpen size={18} />,
      content: "Drag a PDF, DOCX, or TXT file to the upload area, or click 'Choose files' to select one. SMOT supports multiple uploads. After uploading, the document will appear in the Dashboard.",
      keywords: ["upload", "document", "file", "pdf", "docx"],
    },
    {
      id: "search",
      title: "How to search",
      icon: <Search size={18} />,
      content: "Use the search bar at the top to find keywords in your documents. SMOT searches the full text of indexed documents and shows excerpts with highlighted matches.",
      keywords: ["search", "find", "full-text", "fts5", "keyword"],
    },
    {
      id: "chat",
      title: "How to use AI chat",
      icon: <MessageSquare size={18} />,
      content: "The RAG chat lets you ask questions in natural language. SMOT searches your documents and returns answers based on real content. AI is optional: without Ollama, chat works in search-only mode.",
      keywords: ["chat", "ai", "ollama", "question", "rag"],
    },
    {
      id: "indexing",
      title: "What is indexing",
      icon: <Cpu size={18} />,
      content: "Indexing prepares documents for search. SMOT extracts text, splits it into chunks, and stores it in the database. Indexed documents are marked with a green flag in the Dashboard.",
      keywords: ["indexing", "index", "chunk", "process"],
    },
    {
      id: "license",
      title: "How to activate your license",
      icon: <Key size={18} />,
      content: "Enter the key you received via email in the format SMOT-PREMIUM-XXXX-XXXX-XXXX. You can activate it during onboarding or in Settings. The 7-day free trial requires no credit card.",
      keywords: ["license", "key", "activate", "trial"],
    },
    {
      id: "settings",
      title: "Customizing SMOT",
      icon: <Settings size={18} />,
      content: "In Settings you can change the language (IT/EN), select the hardware mode (Performance/Balanced/Lite), and manage AI models. Changes are saved automatically.",
      keywords: ["settings", "language", "mode", "configuration"],
    },
    {
      id: "privacy",
      title: "Is my data safe?",
      icon: <HelpCircle size={18} />,
      content: "Absolutely. SMOT works completely offline, with no cloud and no telemetry. All your documents stay on your computer. The optional AI (Ollama) is also local. Zero data sent to external servers.",
      keywords: ["privacy", "safe", "data", "offline", "cloud", "telemetry"],
    },
    {
      id: "troubleshoot",
      title: "Troubleshooting",
      icon: <HelpCircle size={18} />,
      content: "If the app won't start: check it has the necessary permissions. If upload fails: check the file isn't corrupted. If chat doesn't respond: verify Ollama is running (if using AI). For help, open an issue on GitHub.",
      keywords: ["troubleshoot", "error", "crash", "not working", "help"],
    },
  ],
};

export function HelpCenter({ onClose }: HelpCenterProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const localizedArticles = articles[language] ?? articles.en;

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return localizedArticles;
    const q = searchQuery.toLowerCase();
    return localizedArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery, localizedArticles]);

  const selected = selectedArticle
    ? localizedArticles.find((a) => a.id === selectedArticle)
    : null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <BookOpen size={20} />
            {language === "it" ? "Guida SMOT" : "SMOT Help"}
          </h2>
          <button onClick={onClose} style={styles.closeButton} type="button">
            <X size={20} />
          </button>
        </div>

        <div style={styles.searchWrapper}>
          <Search size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedArticle(null);
            }}
            placeholder={language === "it" ? "Cerca nella guida..." : "Search help..."}
            style={styles.searchInput}
            autoFocus
          />
        </div>

        <div style={styles.content}>
          {selected ? (
            <div style={styles.article}>
              <button
                onClick={() => setSelectedArticle(null)}
                style={styles.backLink}
                type="button"
              >
                <ChevronRight size={16} />
                {language === "it" ? "Torna alla lista" : "Back to list"}
              </button>
              <div style={styles.articleHeader}>
                {selected.icon}
                <h3 style={styles.articleTitle}>{selected.title}</h3>
              </div>
              <p style={styles.articleContent}>{selected.content}</p>
            </div>
          ) : (
            <div style={styles.list}>
              {filtered.length === 0 ? (
                <p style={styles.emptyText}>
                  {language === "it"
                    ? "Nessun risultato trovato."
                    : "No results found."}
                </p>
              ) : (
                filtered.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article.id)}
                    style={styles.articleItem}
                    type="button"
                  >
                    <span style={styles.articleIcon}>{article.icon}</span>
                    <span style={styles.articleItemTitle}>{article.title}</span>
                    <ChevronRight size={16} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  panel: {
    width: "100%",
    maxWidth: "560px",
    maxHeight: "80vh",
    background: "#0a1a3b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "8px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "16px 24px",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.4)",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "0.95rem",
    outline: "none",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "0 24px 24px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  articleItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.95rem",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 200ms ease",
    width: "100%",
  },
  articleIcon: {
    color: "#4338f5",
    display: "flex",
    alignItems: "center",
  },
  articleItemTitle: {
    flex: 1,
  },
  article: {},
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
    cursor: "pointer",
    padding: "8px 0",
    marginBottom: "16px",
  },
  articleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
    color: "#4338f5",
  },
  articleTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#ffffff",
    margin: 0,
  },
  articleContent: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.95rem",
    lineHeight: 1.7,
    margin: 0,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    padding: "40px 0",
  },
};
