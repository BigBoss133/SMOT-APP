import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function WizardProgress({ currentStep, totalSteps, labels }: WizardProgressProps) {
  return (
    <div style={styles.container}>
      <div style={styles.stepsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} style={styles.stepWrapper}>
              <div
                style={{
                  ...styles.dot,
                  ...(isCompleted ? styles.dotCompleted : {}),
                  ...(isCurrent ? styles.dotCurrent : {}),
                }}
              >
                {isCompleted ? (
                  <Check size={14} />
                ) : (
                  <span style={styles.dotInner} />
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  style={{
                    ...styles.line,
                    ...(isCompleted ? styles.lineCompleted : {}),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div style={styles.labelsRow}>
        {labels.map((label, index) => (
          <span
            key={index}
            style={{
              ...styles.label,
              ...(index === currentStep ? styles.labelActive : {}),
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
  },
  stepsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    display: "flex",
    alignItems: "center",
  },
  dot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    transition: "all 300ms ease",
  },
  dotCompleted: {
    background: "#10981a",
    borderColor: "#10981a",
    color: "#ffffff",
  },
  dotCurrent: {
    background: "#4338f5",
    borderColor: "#4338f5",
    color: "#ffffff",
  },
  dotInner: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.5)",
  },
  line: {
    width: "40px",
    height: "2px",
    background: "rgba(255,255,255,0.2)",
    margin: "0 8px",
    transition: "background 300ms ease",
  },
  lineCompleted: {
    background: "#10981a",
  },
  labelsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  label: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.5)",
    minWidth: "70px",
    textAlign: "center",
    transition: "color 300ms ease",
  },
  labelActive: {
    color: "#ffffff",
    fontWeight: 600,
  },
};
