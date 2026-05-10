import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary per catturare errori di rendering React.
 * Previene il crash completo dell'app mostrando un fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Qui si potrebbe inviare l'errore a un servizio di logging (Sentry, etc.)
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            backgroundColor: "#0f0f0f",
            color: "#e0e0e0",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#ef4444" }}>
            Oops! Qualcosa è andato storto
          </h1>
          <p style={{ marginBottom: "2rem", textAlign: "center", maxWidth: "500px" }}>
            L'applicazione ha riscontrato un errore imprevisto. 
            Puoi ricaricare la pagina o tornare alla home.
          </p>
          {this.state.error && (
            <pre
              style={{
                backgroundColor: "#1a1a1a",
                padding: "1rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
                color: "#888",
                maxWidth: "100%",
                overflow: "auto",
                marginBottom: "2rem",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={this.handleGoHome}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                border: "1px solid #444",
                borderRadius: "6px",
                color: "#e0e0e0",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Torna alla Home
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Ricarica App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
