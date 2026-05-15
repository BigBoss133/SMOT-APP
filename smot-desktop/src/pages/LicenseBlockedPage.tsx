import { useState } from "react";
import { ShieldAlert, Check, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

interface LicenseBlockedPageProps {
  onLicenseValidated?: () => void;
}

export default function LicenseBlockedPage({ onLicenseValidated }: LicenseBlockedPageProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [licenseKey, setLicenseKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");

  const formatLicenseKey = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.slice(0, 4).join("-");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setIsValid(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(formatted));
    setError("");
  };

  const handleValidate = async () => {
    if (!isValid) {
      setError(t.license.invalidKey);
      return;
    }
    try {
      // @ts-ignore
      if (window.__TAURI_INTERNALS__) {
        const tauriCore = await import("@tauri-apps/api/core");
        const result = await tauriCore.invoke<{ valid: boolean }>("validate_license", { key: licenseKey });
        if (result.valid) {
          onLicenseValidated?.();
        } else {
          setError(t.license.invalidKey);
        }
      }
    } catch {
      setError(t.license.invalidKey);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.iconWrapper}>
          <ShieldAlert size={48} />
        </div>

        <h1 style={styles.title}>{t.license.blockedTitle}</h1>
        <p style={styles.description}>{t.license.blockedDescription}</p>

        <div style={styles.inputGroup}>
          <input
            type="text"
            value={licenseKey}
            onChange={handleInputChange}
            placeholder={t.license.enterKey}
            style={styles.input}
            maxLength={19}
            autoFocus
          />
          {isValid && (
            <div style={styles.validIcon}>
              <Check size={20} />
            </div>
          )}
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button
          onClick={handleValidate}
          disabled={!isValid}
          style={{
            ...styles.validateButton,
            ...(isValid ? styles.validateButtonActive : {}),
          }}
          type="button"
        >
          {t.license.validate}
        </button>

        <a
          href="https://smot.app/pricing"
          style={styles.renewLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.license.renew}
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at top, #1e3a8a 0%, #0a1a3b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'Manrope', 'Segoe UI', sans-serif",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
  },
  iconWrapper: {
    color: "#f59e0b",
    background: "rgba(245, 158, 11, 0.1)",
    padding: "20px",
    borderRadius: "50%",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
  },
  description: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.5,
    margin: 0,
  },
  inputGroup: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    fontSize: "1.1rem",
    fontFamily: "monospace",
    letterSpacing: "0.1em",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    color: "#ffffff",
    outline: "none",
    textAlign: "center",
  },
  validIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#10981a",
  },
  errorText: {
    color: "#f59e0b",
    fontSize: "0.85rem",
    margin: 0,
  },
  validateButton: {
    width: "100%",
    padding: "14px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "not-allowed",
    transition: "all 200ms ease",
  },
  validateButtonActive: {
    background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
  },
  renewLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.9rem",
    textDecoration: "none",
    transition: "color 200ms ease",
  },
};