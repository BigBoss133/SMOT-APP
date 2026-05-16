import { Languages, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LicenseBanner } from "./components/LicenseBanner";
import { RightSystemPanel } from "./components/RightSystemPanel";
import { SidebarNav } from "./components/SidebarNav";
import { StatusBar } from "./components/StatusBar";
import { useLanguage } from "./context/LanguageContext";
import { translations } from "./i18n/translations";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import GraphPage from "./pages/GraphPage";
import IndexingPage from "./pages/IndexingPage";
import LicenseBlockedPage from "./pages/LicenseBlockedPage";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import UploadPage from "./pages/UploadPage";
import ViewerPage from "./pages/ViewerPage";
import {
  getDocuments,
  getModes,
  getSystemStatus,
  updateMode,
} from "./services/api";
import { invoke, listen, isTauri } from "./services/tauri";
import type { LicenseStatusType, ModeData, SystemStatus, ViewerDocument } from "./types";

const fallbackModes: ModeData = {
  active_mode: "Balanced",
  available_modes: ["Performance", "Balanced", "Lite"],
};

export default function App() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const text = translations[language];
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [documents, setDocuments] = useState<ViewerDocument[]>([]);
  const [modeData, setModeData] = useState<ModeData>(fallbackModes);
  const [searchValue, setSearchValue] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatusType>("trial");
  const [licenseBlocked, setLicenseBlocked] = useState(false);
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch {
      setDocuments([]);
    }
  }, []);

  const refreshSystem = useCallback(async () => {
    try {
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch {
      setSystemStatus(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unlisten: (() => void) | undefined;

    const bootstrap = async () => {
      try {
        const [docs, status, modes] = await Promise.all([
          getDocuments(), getSystemStatus(), getModes(),
        ]);
        if (!active) return;
        setDocuments(docs);
        setSystemStatus(status);
        setModeData(modes);
      } catch {
        if (!active) return;
        setDocuments([]);
        setSystemStatus(null);
        setModeData(fallbackModes);
      }
    };

    const setupListener = async () => {
      if (!isTauri()) return;
      unlisten = await listen("first-launch", () => {
        navigate("/onboarding");
      });
    };

    const checkLicense = async () => {
      if (!isTauri()) return;
      try {
        const info = await invoke<{ status: LicenseStatusType }>("get_license_status");
        setLicenseStatus(info.status);
        if (info.status === "blocked") {
          setLicenseBlocked(true);
          navigate("/license-blocked");
        }
      } catch {
        // Not in Tauri or license module not ready; use default
      }
    };

    void bootstrap();
    void setupListener();
    void checkLicense();

    const timer = setInterval(() => {
      void refreshSystem();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
      if (unlisten) {
        unlisten();
      }
    };
  }, [refreshSystem, navigate]);

  const changeMode = async (mode: string) => {
    try {
      const next = await updateMode(mode);
      setModeData(next);
    } catch {
      setModeData((prev) => ({ ...prev, active_mode: mode }));
    }
  };

  const handleLicenseValidated = () => {
    setLicenseBlocked(false);
    setLicenseStatus("active");
    navigate("/");
  };

  if (licenseBlocked) {
    return <LicenseBlockedPage onLicenseValidated={handleLicenseValidated} />;
  }

  return (
    <div className="app-shell" data-testid="smot-app-shell">
      {!isOnboarding && licenseStatus === "grace" && <LicenseBanner />}

      {!isOnboarding && <SidebarNav />}

      <main className="main-content" data-testid="main-content-area">
        {!isOnboarding && (
          <header className="topbar" data-testid="main-topbar">
            <h1 data-testid="app-main-title">{text.appName}</h1>
            <div className="topbar-actions" data-testid="topbar-actions">
              <label className="search-box" data-testid="topbar-search-box">
                <Search size={15} />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={text.searchPlaceholder}
                  data-testid="topbar-search-input"
                />
              </label>
              <button
                className="language-toggle"
                onClick={toggleLanguage}
                data-testid="language-toggle-button"
              >
                <Languages size={16} />
                <span data-testid="language-toggle-value">
                  {language.toUpperCase()}
                </span>
              </button>
            </div>
          </header>
        )}

        <ErrorBoundary>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/license-blocked" element={<LicenseBlockedPage onLicenseValidated={handleLicenseValidated} />} />
            <Route
              path="/"
              element={
                <DashboardPage
                  documents={documents}
                  modeData={modeData}
                  onModeChange={changeMode}
                />
              }
            />
            <Route
              path="/upload"
              element={<UploadPage onRefreshDocuments={refreshDocuments} />}
            />
            <Route
              path="/indexing/:jobId"
              element={<IndexingPage onStatusUpdate={() => void refreshDocuments()} />}
            />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/viewer" element={<ViewerPage />} />
            <Route path="/viewer/:documentId" element={<ViewerPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route
              path="/settings"
              element={<SettingsPage modeData={modeData} onModeChange={changeMode} />}
            />
          </Routes>
        </ErrorBoundary>
      </main>

      {!isOnboarding && <RightSystemPanel status={systemStatus} />}
      {!isOnboarding && <StatusBar
        mode={modeData.active_mode}
        indexedCount={documents.filter((doc) => doc.indexed).length}
        totalCount={documents.length}
      />}
    </div>
  );
}