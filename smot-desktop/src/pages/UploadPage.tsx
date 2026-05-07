import {
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { translations } from "../i18n/translations";
import { uploadDocuments, startIndexing } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

interface UploadPageProps {
  onRefreshDocuments: () => Promise<void>;
}

export default function UploadPage({ onRefreshDocuments }: UploadPageProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations[language];
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const fileNames = useMemo(() => localFiles.map((file) => file.name), [localFiles]);

  const handlePickFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setLocalFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer.files ?? []);
    setLocalFiles((prev) => [...prev, ...dropped]);
  };

  const beginIndexing = async () => {
    if (!fileNames.length) {
      setError("Aggiungi almeno un file prima di iniziare.");
      return;
    }
    try {
      setError("");
      setIsUploading(true);
      const uploadResult = await uploadDocuments(fileNames, "Lavoro");
      const ids = uploadResult.uploaded_documents.map((doc) => doc.id);
      const indexingResult = await startIndexing(ids);
      await onRefreshDocuments();
      navigate(`/indexing/${indexingResult.job_id}`);
    } catch {
      setError("Errore durante upload o indicizzazione.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-grid" data-testid="upload-page">
      <section
        className="upload-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        data-testid="upload-dropzone"
      >
        <h1 data-testid="upload-page-title">{text.documentUpload}</h1>
        <p data-testid="upload-dropzone-title">{text.dragDropTitle}</p>
        <p className="card-muted" data-testid="upload-dropzone-hint">
          {text.dragDropHint}
        </p>
        <label className="action-button" data-testid="upload-file-picker-label">
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
              <p className="list-item static" key={name} data-testid={`upload-selected-file-${name}`}>
                {name}
              </p>
            ))
          ) : (
            <p className="card-muted" data-testid="upload-selected-files-empty">
              Nessun file selezionato.
            </p>
          )}
        </div>
        {error ? (
          <p className="error-text" data-testid="upload-error-message">
            {error}
          </p>
        ) : null}
        <div className="action-row" data-testid="upload-action-row">
          <button
            className="action-button secondary"
            onClick={() => navigate("/")}
            data-testid="upload-cancel-button"
          >
            {text.cancel}
          </button>
          <button
            className="action-button"
            onClick={beginIndexing}
            disabled={isUploading}
            data-testid="upload-start-indexing-button"
          >
            {isUploading ? "..." : text.startIndexing}
          </button>
        </div>
      </section>
    </div>
  );
}
