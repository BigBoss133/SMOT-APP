import React, { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Search, Languages } from 'lucide-react';
import { SidebarNav } from './components/SidebarNav';
import { RightSystemPanel } from './components/RightSystemPanel';
import { StatusBar } from './components/StatusBar';
import { useLanguage } from './context/LanguageContext';
import { translations } from './i18n/translations';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import IndexingPage from './pages/IndexingPage';
import ChatPage from './pages/ChatPage';
import ViewerPage from './pages/ViewerPage';
import SettingsPage from './pages/SettingsPage';
import { getDocuments, getModes, getSystemStatus, updateMode } from './services/api';

export default function App() {
  const { language, toggleLanguage } = useLanguage();
  const text = translations[language];
  const [systemStatus, setSystemStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [modeData, setModeData] = useState({ active_mode: 'Balanced', available_modes: [] });
  const [searchValue, setSearchValue] = useState('');

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

  const refreshModes = useCallback(async () => {
    try {
      const data = await getModes();
      setModeData(data);
    } catch {
      setModeData({ active_mode: 'Balanced', available_modes: ['Performance', 'Balanced', 'Lite'] });
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
    refreshSystem();
    refreshModes();
    const timer = setInterval(refreshSystem, 5000);
    return () => clearInterval(timer);
  }, [refreshDocuments, refreshModes, refreshSystem]);

  const changeMode = async (mode) => {
    try {
      const next = await updateMode(mode);
      setModeData(next);
    } catch {
      setModeData((prev) => ({ ...prev, active_mode: mode }));
    }
  };

  return (
    <div className="app-shell" data-testid="smot-app-shell">
      <SidebarNav />

      <main className="main-content" data-testid="main-content-area">
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
            <button className="language-toggle" onClick={toggleLanguage} data-testid="language-toggle-button">
              <Languages size={16} />
              <span data-testid="language-toggle-value">{language.toUpperCase()}</span>
            </button>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={<DashboardPage documents={documents} modeData={modeData} onModeChange={changeMode} />}
          />
          <Route path="/upload" element={<UploadPage onRefreshDocuments={refreshDocuments} />} />
          <Route path="/indexing/:jobId" element={<IndexingPage onStatusUpdate={() => refreshDocuments()} />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="/viewer/:documentId" element={<ViewerPage />} />
          <Route path="/settings" element={<SettingsPage modeData={modeData} onModeChange={changeMode} />} />
        </Routes>
      </main>

      <RightSystemPanel status={systemStatus} />
      <StatusBar
        mode={modeData.active_mode}
        indexedCount={documents.filter((doc) => doc.indexed).length}
        totalCount={documents.length}
      />
    </div>
  );
}
