import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <button
      onClick={toggleLang}
      className="fixed top-4 right-4 z-[200] cyber-glass px-3 py-1.5 rounded-full border border-[#00E5FF]/50 flex items-center space-x-2 hover:bg-[#00E5FF]/20 transition-colors group"
    >
      <Globe size={16} className="text-[#00E5FF] group-hover:animate-spin" />
      <span className="text-[#00E5FF] font-mono text-xs font-bold uppercase tracking-widest">
        {language === 'en' ? 'EN' : 'CN'}
      </span>
    </button>
  );
};
