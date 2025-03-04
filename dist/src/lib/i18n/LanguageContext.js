import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { translations } from './translations';
const LanguageContext = createContext(undefined);
export function LanguageProvider({ children }) {
    const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
    const value = {
        t: translations[currentLanguage],
        currentLanguage,
        setLanguage: setCurrentLanguage
    };
    return (_jsx(LanguageContext.Provider, { value: value, children: children }));
}
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
