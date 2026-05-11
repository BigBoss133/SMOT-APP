import {
  useMemo, useState,
  type ChangeEvent, type DragEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { translations } from "../i18n/translations";
import { uploadDocuments, startIndexing } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

interface UploadPageProps {
  onRefreshDocuments: () => Promise<void>;
}

export default function UploadPage({ onRefreshDocuments }: UploadPageProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations[language];
  const toast = useToast();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [fileToRemove, setFileToRemove] = useState<string | null>(null);

  const fileNames = useMemo(() => localFiles.map((file) => file.name), [localFiles]);

  const handlePickFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setLocalFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(event.dataTransfer.files ?? []);
    setLocalFiles((prev) => [...prev, ...dropped]);
  };

  const beginIndexing = async () => {
    if (!fileNames.length) { setError("Aggiungi almeno un file prima di iniziare."); return; }
    try {
      setError("");
      setIsUploading(true);
      const uploadResult = await uploadDocuments(fileNames, "Lavoro");
      const ids = uploadResult.uploaded_documents.map((doc) => doc.id);
      const indexingResult = await startIndexing(ids);
      await onRefreshDocuments();
      toast.success(text.uploadSuccess);
      navigate(`/indexing/${indexingResult.job_id}`);
    } catch {
      setError("Errore durante upload o indicizzazione.");
      toast.error(text.uploadError);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-grid" data-testid="upload-page">
      <section
        className={`upload-dropzone${isDragging ? " dropzone-active" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        data-testid="upload-dropzone"
      >
        <h1 data-testid="upload-page-title">{text.documentUpload}</h1>
        <p data-testid="upload-dropzone-title">{text.dragDropTitle}</p>
        <p className="card-muted" data-testid="upload-dropzone-hint">{text.dragDropHint}</p>
        <label className="action-button" style={{ cursor: "pointer" }} data-testid="upload-file-picker-label">
          {text.chooseFiles}
          <input
            type="file"
            multiple
            onChange={handlePickFiles}
            className="hidden-input"
            data-testid="upload-file-picker-input"
          />
        </label>
        <p className="card-muted" data-testid="upload-supported-formats">
          PDF • DOCX • TXT • PNG • JPG • ZIP
        </p>
      </section>

      <section className="panel-card" data-testid="upload-selected-files-card">
        <h2 data-testid="upload-selected-files-title">File selezionati</h2>
        <div className="list-stack" data-testid="upload-selected-files-list">
          {fileNames.length ? (
            fileNames.map((name) => (
              <div
                className="list-item static file-item"
                key={name}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                data-testid={`upload-selected-file-${name}`}
              >
                <span>{name}</span>
                <button
                  className="icon-button"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#ef4444",
                    padding: "4px",
                  }}
                  onClick={() => setFileToRemove(name)}
                  data-testid={`upload-remove-file-${name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="card-muted" data-testid="upload-selected-files-empty">
              Nessun file selezionato.
            </p>
          )}
        </div>
        {isUploading && (
          <div className="progress-track" style={{ marginTop: 12 }} data-testid="upload-progress-track">
            <div className="progress-fill upload-progress-bar" style={{ width: "100%" }} />
          </div>
        )}
        {error ? <p className="error-text" data-testid="upload-error-message">{error}</p> : null}
        <ConfirmDialog
          open={!!fileToRemove}
          title="Rimuovi file"
          message={`Sei sicuro di voler rimuovere "${fileToRemove}" dalla lista?`}
          confirmLabel="Rimuovi"
          confirmVariant="danger"
          onConfirm={() => {
            if (fileToRemove) {
              setLocalFiles((prev) => prev.filter((f) => f.name !== fileToRemove));
              setFileToRemove(null);
            }
          }}
          onCancel={() => setFileToRemove(null)}
        />
        <div className="action-row" data-testid="upload-action-row">
          <button className="action-button secondary" onClick={() => navigate("/")} data-testid="upload-cancel-button">
            {text.cancel}
          </button>
          <button
            className="action-button"
            onClick={beginIndexing}
            disabled={isUploading}
            data-testid="upload-start-indexing-button"
          >
            {isUploading ? "Caricamento..." : text.startIndexing}
          </button>
        </div>
      </section>
    </div>
  );
}
