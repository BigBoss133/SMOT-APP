import React, { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('it');

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () => setLanguage((current) => (current === 'it' ? 'en' : 'it')),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
};
