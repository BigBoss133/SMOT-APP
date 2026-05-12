import { AlertTriangle, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

export function LicenseBanner() {
  const { language } = useLanguage();
  const t = translations[language].license;

  return (
    <div style={styles.banner}>
      <AlertTriangle size={16} />
      <span style={styles.text}>{t.graceWarning}</span>
      <a
        href="https://smot.app/pricing"
        style={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.renew}
        <ExternalLink size={12} />
      </a>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 20px",
    background: "rgba(245, 158, 11, 0.12)",
    borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
    color: "#f59e0b",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  text: {
    flex: 1,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#f59e0b",
    fontWeight: 600,
    textDecoration: "underline",
    fontSize: "0.85rem",
  },
};
