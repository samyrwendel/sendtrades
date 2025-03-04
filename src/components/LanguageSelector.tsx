import React from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'pt')}
      className="ml-4 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    >
      <option value="en">English</option>
      <option value="pt">Português</option>
    </select>
  );
}