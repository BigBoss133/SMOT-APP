import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { WizardProgress } from "../components/onboarding/WizardProgress";
import { SystemDiscoveryStep } from "../components/onboarding/SystemDiscoveryStep";
import { LicenseStep } from "../components/onboarding/LicenseStep";
import { ModelDownloadStep } from "../components/onboarding/ModelDownloadStep";
import { FirstDocumentStep } from "../components/onboarding/FirstDocumentStep";
import { CompletionStep } from "../components/onboarding/CompletionStep";
import { invoke, listen } from "../services/tauri";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";
import { useToast } from "../context/ToastContext";

interface SystemProfile {
  cpu_cores: number;
  ram_total_gb: number;
  ram_available_gb: number;
  gpu_name: string | null;
  gpu_vram_gb: number | null;
  is_unified_memory: boolean;
  os_name: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { success, error: showError } = useToast();
  const t = translations[language].wizard;

  const [currentStep, setCurrentStep] = useState(0);
  const [systemProfile, setSystemProfile] = useState<SystemProfile | null>(null);
  const [tier, setTier] = useState("Minimal");
  const [licenseChoice, setLicenseChoice] = useState<{ type: "trial" | "license"; key?: string } | null>(null);
  const [modelStatus, setModelStatus] = useState<string>("skipped");
  const [firstDoc, setFirstDoc] = useState<File | null>(null);

  const handleSystemProbeError = useCallback(() => {
    showError(translations[language].onboardingError);
    setSystemProfile(null);
    setTier("Essential");
  }, [showError, language]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<SystemProfile & { tier: string }>("first-launch", (payload) => {
          if (payload && payload.cpu_cores) {
            setSystemProfile(payload);
            setTier(payload.tier);
          } else {
            handleSystemProbeError();
          }
        });
      } catch {
        handleSystemProbeError();
      }
    };

    void setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [handleSystemProbeError]);

  const handleLicenseSelect = useCallback((choice: "trial" | "license", key?: string) => {
    setLicenseChoice({ type: choice, key });
    setCurrentStep((prev) => prev + 1);
  }, []);

  const handleModelSkip = useCallback(() => {
    setModelStatus("skipped");
    setCurrentStep((prev) => prev + 1);
  }, []);

  const handleFileSelected = useCallback((file: File | null) => {
    setFirstDoc(file);
  }, []);

  const handleSkipAll = useCallback(async () => {
    try {
      await invoke("complete_onboarding");
    } catch {
      // ignore
    }
    success(translations[language].welcomeOnboarding);
    navigate("/");
  }, [navigate, success, language]);

  const handleFinish = useCallback(async () => {
    try {
      await invoke("complete_onboarding");
      success(translations[language].welcomeOnboarding);
    } catch {
      // Even if complete_onboarding fails, navigate to dashboard
      success(translations[language].welcomeOnboarding);
    }
    navigate("/");
  }, [navigate, success, language]);

  const stepLabels = [t.stepScan, t.stepLicense, t.stepModel, t.stepDoc, t.stepDone];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SystemDiscoveryStep
            profile={systemProfile}
            tier={tier}
            t={{
              scanTitle: t.scanTitle,
              scanCpu: t.scanCpu,
              scanRam: t.scanRam,
              scanGpu: t.scanGpu,
              scanTier: t.scanTier,
            }}
          />
        );
      case 1:
        return (
          <LicenseStep
            onSelect={handleLicenseSelect}
            t={{
              licenseTitle: t.licenseTitle,
              trialTitle: t.trialTitle,
              trialSubtitle: t.trialSubtitle,
              licenseKeyTitle: t.licenseKeyTitle,
              licensePlaceholder: t.licensePlaceholder,
            }}
          />
        );
      case 2:
        return (
          <ModelDownloadStep
            tier={tier}
            onSkip={handleModelSkip}
            t={{
              modelTitle: t.modelTitle,
              modelRecommended: t.modelRecommended,
              modelNeeded: t.modelNeeded,
              downloadNow: t.downloadNow,
              downloadBackground: t.downloadBackground,
              skipModel: t.skipModel,
              aiNotSupported: t.aiNotSupported,
            }}
          />
        );
      case 3:
        return (
          <FirstDocumentStep
            onFileSelected={handleFileSelected}
            t={{
              firstDocTitle: t.firstDocTitle,
              dropHere: t.dropHere,
              browseFiles: t.browseFiles,
            }}
          />
        );
      case 4:
        return (
          <CompletionStep
            summary={{
              tier,
              model: modelStatus === "skipped" ? "Nessuno (modalità ricerca)" : "Llama 3.2 + Nomic",
              license: licenseChoice?.type === "trial" ? "Prova 7 giorni" : licenseChoice?.key ?? "Sconosciuta",
              firstDocName: firstDoc?.name ?? null,
            }}
            onFinish={handleFinish}
            t={{
              completionTitle: t.completionTitle,
              goToDashboard: t.goToDashboard,
            }}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return licenseChoice !== null;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <WizardProgress currentStep={currentStep} totalSteps={5} labels={stepLabels} />

        <div style={styles.content}>
          <div
            style={{
              ...styles.stepContent,
              animation: "step-enter 400ms ease-out",
            }}
            key={currentStep}
          >
            {renderStep()}
          </div>
        </div>

        {currentStep < 4 && (
          <div style={styles.navigation}>
            {currentStep > 0 && (
              <button onClick={handleBack} style={styles.backButton} type="button">
                <ChevronLeft size={18} />
                {t.back}
              </button>
            )}
            <button onClick={handleSkipAll} style={styles.skipButton} type="button">
              <SkipForward size={16} />
              {t.skipAll}
            </button>
            {currentStep !== 1 && currentStep !== 2 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                style={{
                  ...styles.nextButton,
                  ...(!canProceed() ? styles.buttonDisabled : {}),
                }}
                type="button"
              >
                {t.next}
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes step-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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
    width: "100%",
    maxWidth: "600px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  content: {
    width: "100%",
    minHeight: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    width: "100%",
  },
  navigation: {
    display: "flex",
    gap: "16px",
    marginTop: "40px",
  },
  backButton: {
    padding: "12px 24px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 200ms ease",
  },
  nextButton: {
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
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  skipButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 20px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 200ms ease",
    marginLeft: "auto",
  },
};
