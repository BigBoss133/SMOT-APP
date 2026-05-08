import { useEffect, useState } from "react";
import { Sparkles, Cpu, Key, File, ChevronRight } from "lucide-react";

interface CompletionStepProps {
  summary: {
    tier: string;
    model: string;
    license: string;
    firstDocName: string | null;
  };
  onFinish: () => void;
  t: {
    completionTitle: string;
    goToDashboard: string;
  };
}

const tierColors: Record<string, { bg: string; text: string }> = {
  Premium: { bg: "#4338f5", text: "#ffffff" },
  Standard: { bg: "#6b7280", text: "#ffffff" },
  Essential: { bg: "#f59e0b", text: "#000000" },
  Minimal: { bg: "#9ca3af", text: "#000000" },
};

export function CompletionStep({ summary, onFinish, t }: CompletionStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  const summaryItems = [
    {
      icon: <Cpu size={18} />,
      label: "Tier",
      value: summary.tier,
      badge: true,
    },
    {
      icon: <Key size={18} />,
      label: "Licenza",
      value: summary.license,
    },
    {
      icon: <Sparkles size={18} />,
      label: "Modello",
      value: summary.model,
    },
    ...(summary.firstDocName
      ? [
          {
            icon: <File size={18} />,
            label: "Primo documento",
            value: summary.firstDocName,
          },
        ]
      : []),
  ];

  return (
    <div style={styles.container}>
      {showConfetti && <ConfettiAnimation />}

      <div style={styles.celebrationIcon}>
        <Sparkles size={48} />
      </div>

      <h2 style={styles.title}>{t.completionTitle}</h2>

      <div style={styles.summaryCard}>
        {summaryItems.map((item, index) => (
          <div key={index} style={styles.summaryRow}>
            <div style={styles.summaryIcon}>{item.icon}</div>
            <span style={styles.summaryLabel}>{item.label}</span>
            {item.badge ? (
              <span
                style={{
                  ...styles.tierBadge,
                  background: tierColors[summary.tier]?.bg ?? tierColors.Minimal.bg,
                  color: tierColors[summary.tier]?.text ?? tierColors.Minimal.text,
                }}
              >
                {item.value}
              </span>
            ) : (
              <span style={styles.summaryValue}>{item.value}</span>
            )}
          </div>
        ))}
      </div>

      <button onClick={onFinish} style={styles.finishButton} type="button">
        {t.goToDashboard}
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function ConfettiAnimation() {
  const [pieces, setPieces] = useState<
    Array<{
      id: number;
      left: number;
      delay: number;
      duration: number;
      color: string;
    }>
  >([]);

  useEffect(() => {
    const colors = ["#4338f5", "#894df8", "#bcc41c", "#10981a", "#f59e0b"];
    const newPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div style={styles.confettiContainer}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            ...styles.confettiPiece,
            left: `${piece.left}%`,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
    position: "relative",
    overflow: "hidden",
  },
  confettiContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 100,
    overflow: "hidden",
  },
  confettiPiece: {
    position: "absolute",
    top: "-10px",
    width: "8px",
    height: "8px",
    animation: "confetti-fall linear forwards",
  },
  celebrationIcon: {
    color: "#4338f5",
    animation: "pulse 2s ease-in-out infinite",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center",
  },
  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "400px",
    padding: "24px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  summaryIcon: {
    color: "rgba(255,255,255,0.5)",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.9rem",
    minWidth: "120px",
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 500,
    flex: 1,
    textAlign: "right",
  },
  tierBadge: {
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  finishButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 32px",
    background: "linear-gradient(135deg, #4338f5 0%, #894df8 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 200ms ease, box-shadow 200ms ease",
    boxShadow: "0 8px 32px rgba(67, 56, 245, 0.4)",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;
document.head.appendChild(styleSheet);
