import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLanguage } from '../lib/i18n/LanguageContext';
export function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    return (_jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "ml-4 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500", children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "pt-BR", children: "Portugu\u00EAs" })] }));
}
