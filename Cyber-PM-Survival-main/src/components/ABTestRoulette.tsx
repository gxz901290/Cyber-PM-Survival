import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../hooks/useAudio';
import { Activity, XCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type ABResult = 'SIGNIFICANT' | 'NEGATIVE' | 'INCONCLUSIVE';

interface ABTestRouletteProps {
  onComplete: (result: ABResult) => void;
}

export const ABTestRoulette: React.FC<ABTestRouletteProps> = ({ onComplete }) => {
  const [spinning, setSpinning] = useState(true);
  const [result, setResult] = useState<ABResult | null>(null);
  const { playClick, playSuccess, playError } = useAudio();
  const { t } = useLanguage();

  useEffect(() => {
    playClick();
    const timer = setTimeout(() => {
      setSpinning(false);
      const rand = Math.random();
      let res: ABResult;
      if (rand < 0.3) {
        res = 'SIGNIFICANT';
        playSuccess();
      } else if (rand < 0.6) {
        res = 'NEGATIVE';
        playError();
      } else {
        res = 'INCONCLUSIVE';
        playClick();
      }
      setResult(res);

      setTimeout(() => {
        onComplete(res);
      }, 3000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete, playClick, playSuccess, playError]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="cyber-glass p-8 rounded-xl border border-white/20 flex flex-col items-center max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[#00E5FF] uppercase tracking-widest neon-text-blue">
          {t('abTitle')}
        </h2>

        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {spinning ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-full h-full rounded-full border-4 border-dashed border-[#00E5FF] opacity-50"
            />
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center justify-center"
            >
              {result === 'SIGNIFICANT' && (
                <div className="text-center">
                  <Activity size={64} className="text-[#FFD700] mx-auto mb-4 neon-text-gold" />
                  <span className="text-2xl font-bold text-[#FFD700] uppercase">{t('abSig')}</span>
                </div>
              )}
              {result === 'NEGATIVE' && (
                <div className="text-center">
                  <XCircle size={64} className="text-[#FF003C] mx-auto mb-4 neon-text-red" />
                  <span className="text-2xl font-bold text-[#FF003C] uppercase">{t('abNeg')}</span>
                </div>
              )}
              {result === 'INCONCLUSIVE' && (
                <div className="text-center">
                  <HelpCircle size={64} className="text-gray-400 mx-auto mb-4" />
                  <span className="text-xl font-bold text-gray-400 uppercase">{t('abInc')}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="text-center text-sm text-gray-400 font-mono">
          {spinning ? t('abAnalyzing') : (
            result === 'SIGNIFICANT' ? t('abSigDesc') :
            result === 'NEGATIVE' ? t('abNegDesc') :
            t('abIncDesc')
          )}
        </div>
      </motion.div>
    </div>
  );
};
