import { useState } from "react";
import { Check, Gift } from "lucide-react";

interface LicenseStepProps {
  onSelect: (choice: "trial" | "license", key?: string) => void;
  t: {
    licenseTitle: string;
    trialTitle: string;
    trialSubtitle: string;
    licenseKeyTitle: string;
    licensePlaceholder: string;
  };
}

export function LicenseStep({ onSelect, t }: LicenseStepProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValid, setIsValid] = useState(false);

  const formatLicenseKey = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.slice(0, 4).join("-");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setIsValid(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(formatted));
  };

  const handleLicenseSubmit = () => {
    if (isValid) {
      onSelect("license", licenseKey);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.licenseTitle}</h2>

      <div style={styles.options}>
        <button
          onClick={() => onSelect("trial")}
          style={styles.trialButton}
          type="button"
        >
          <div style={styles.trialIcon}>
            <Gift size={32} />
          </div>
          <div style={styles.trialContent}>
            <span style={styles.trialTitle}>{t.trialTitle}</span>
            <span style={styles.trialSubtitle}>{t.trialSubtitle}</span>
          </div>
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>oppure</span>
          <span style={styles.dividerLine} />
        </div>

        <div style={styles.licenseSection}>
          <label style={styles.licenseLabel}>{t.licenseKeyTitle}</label>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={licenseKey}
              onChange={handleInputChange}
              placeholder={t.licensePlaceholder}
              style={styles.licenseInput}
              maxLength={19}
            />
            {isValid && (
              <div style={styles.validIndicator}>
                <Check size={20} />
              </div>
            )}
          </div>
          <button
            onClick={handleLicenseSubmit}
            disabled={!isValid}
            style={{
              ...styles.submitButton,
              ...(isValid ? styles.submitButtonActive : {}),
            }}
            type="button"
          >
            Attiva licenza
          </button>
        </div>
      </div>
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
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    maxWidth: "400px",
  },
  trialButton: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "transform 200ms ease, box-shadow 200ms ease",
    textAlign: "left",
  },
  trialIcon: {
    color: "#ffffff",
    opacity: 0.9,
  },
  trialContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  trialTitle: {
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  trialSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.85rem",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
  },
  licenseSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  licenseLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  licenseInput: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "1.1rem",
    fontFamily: "monospace",
    letterSpacing: "0.1em",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    color: "#ffffff",
    outline: "none",
    transition: "border-color 200ms ease",
  },
  validIndicator: {
    position: "absolute",
    right: "14px",
    color: "#10981a",
  },
  submitButton: {
    padding: "12px 24px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "not-allowed",
    transition: "all 200ms ease",
  },
  submitButtonActive: {
    background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
  },
};
