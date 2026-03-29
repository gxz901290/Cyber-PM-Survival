import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../i18n/LanguageContext';

interface LarkPopupProps {
  onRespond: (success: boolean) => void;
}

export const LarkPopup: React.FC<LarkPopupProps> = ({ onRespond }) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [scenarioIdx] = useState(() => Math.floor(Math.random() * 3) + 1);
  const { playAlert, playClick, playError } = useAudio();
  const { t } = useLanguage();

  useEffect(() => {
    playAlert();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playAlert]);

  useEffect(() => {
    if (timeLeft === 0) {
      playError();
      onRespond(false);
    }
  }, [timeLeft, onRespond, playError]);

  const handleClick = () => {
    playClick();
    onRespond(true);
  };

  const getMsg = () => {
    if (scenarioIdx === 1) return t('p3Chat101');
    if (scenarioIdx === 2) return t('p3Chat102');
    return t('p3Chat103');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-4 right-4 z-50 w-80 cyber-glass border border-[#E94560] rounded-lg p-4 shadow-[0_0_15px_rgba(233,69,96,0.5)]"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-[#E94560] animate-pulse" />
            <h3 className="text-[#E94560] font-bold uppercase tracking-wider text-sm">{t('larkAlert')}</h3>
          </div>
          <span className="text-[10px] font-mono text-[#FF003C] opacity-70">
            [{t('stabilityPenalty')} -15]
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-4 font-mono">
          {getMsg()}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#FF003C] font-mono text-xl font-bold">
            <AlertTriangle size={18} />
            <span>00:0{timeLeft}</span>
          </div>
          <button
            onClick={handleClick}
            className="bg-[#E94560]/20 hover:bg-[#E94560]/40 text-[#E94560] border border-[#E94560] px-4 py-1 rounded font-bold uppercase text-sm transition-colors"
          >
            {t('acknowledge')}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
