import { useState, useRef, useCallback } from "react";
import { Upload, File, Check } from "lucide-react";

interface FirstDocumentStepProps {
  onFileSelected: (file: File | null) => void;
  t: {
    firstDocTitle: string;
    dropHere: string;
    browseFiles: string;
  };
}

export function FirstDocumentStep({ onFileSelected, t }: FirstDocumentStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.firstDocTitle}</h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneActive : {}),
          ...(selectedFile ? styles.dropzoneSuccess : {}),
        }}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileSelect}
          style={styles.hiddenInput}
          accept=".pdf,.doc,.docx,.txt,.md,.html"
        />

        {selectedFile ? (
          <div style={styles.fileSelected}>
            <div style={styles.checkIcon}>
              <Check size={32} />
            </div>
            <div style={styles.fileInfo}>
              <File size={24} style={{ color: "#4338f5" }} />
              <span style={styles.fileName}>{selectedFile.name}</span>
            </div>
            <span style={styles.successText}>Pronto per l&apos;indicizzazione</span>
          </div>
        ) : (
          <>
            <div style={styles.uploadIcon}>
              <Upload size={48} />
            </div>
            <p style={styles.dropText}>{t.dropHere}</p>
            <button onClick={handleBrowseClick} style={styles.browseButton} type="button">
              {t.browseFiles}
            </button>
          </>
        )}
      </div>

      {!selectedFile && (
        <p style={styles.hintText}>PDF, DOC, DOCX, TXT, MD, HTML</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#ffffff",
    textAlign: "center",
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    width: "100%",
    maxWidth: "450px",
    minHeight: "280px",
    padding: "40px",
    background: "rgba(255,255,255,0.03)",
    border: "2px dashed rgba(255,255,255,0.2)",
    borderRadius: "16px",
    transition: "all 300ms ease",
    cursor: "pointer",
  },
  dropzoneActive: {
    background: "rgba(67, 56, 245, 0.1)",
    borderColor: "#4338f5",
  },
  dropzoneSuccess: {
    background: "rgba(16, 152, 26, 0.1)",
    borderColor: "#10981a",
    borderStyle: "solid",
  },
  hiddenInput: {
    display: "none",
  },
  uploadIcon: {
    color: "rgba(255,255,255,0.4)",
  },
  dropText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "1.1rem",
    textAlign: "center",
  },
  browseButton: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 200ms ease",
  },
  hintText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.8rem",
  },
  fileSelected: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  checkIcon: {
    color: "#10981a",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px",
  },
  fileName: {
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  successText: {
    color: "#10981a",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
};
