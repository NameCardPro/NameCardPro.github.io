
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatorPage from './pages/CreatorPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import { BusinessCardData, ScanLog } from './types';
import { Language } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: 'zh', setLang: () => {} });
export const useLanguage = () => useContext(LanguageContext);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [cards, setCards] = useState<BusinessCardData[]>(() => {
    const saved = localStorage.getItem('sbc_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<ScanLog[]>(() => {
    const saved = localStorage.getItem('sbc_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sbc_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('sbc_logs', JSON.stringify(logs));
  }, [logs]);

  const addCard = (card: BusinessCardData) => {
    setCards(prev => [...prev, card]);
  };

  const addLog = (log: ScanLog) => {
    setLogs(prev => [...prev, log]);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<CreatorPage onSave={addCard} cards={cards} />} />
          <Route path="/view/:cardId" element={<LandingPage cards={cards} onLog={addLog} />} />
          <Route path="/dashboard" element={<DashboardPage cards={cards} logs={logs} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </LanguageContext.Provider>
  );
};

export default App;
