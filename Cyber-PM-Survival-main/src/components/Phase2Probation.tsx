import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../i18n/LanguageContext';
import { Bug, Calendar, AlertTriangle } from 'lucide-react';

interface Phase2Props {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  onComplete: () => void;
}

export const Phase2Probation: React.FC<Phase2Props> = ({ state, updateState, onComplete }) => {
  const [stage, setStage] = useState<'SCHEDULE' | 'BUG'>('SCHEDULE');
  const [rdHealth, setRdHealth] = useState(100);
  const [bugCount, setBugCount] = useState(5);
  const [timeLeft, setTimeLeft] = useState(10);
  const { playClick, playError, playSuccess, playAlert } = useAudio();
  const { t } = useLanguage();

  const handleFight = () => {
    playClick();
    if (state.attributes.communication >= 5) {
      updateState({
        attributes: {
          ...state.attributes,
          communication: state.attributes.communication - 5,
          sanity: state.attributes.sanity - 2
        }
      });
      setRdHealth(prev => Math.max(0, prev - 25));
      if (rdHealth <= 25) {
        playSuccess();
        setTimeout(() => setStage('BUG'), 1000);
      }
    } else {
      playError();
      // Not enough communication
    }
  };

  useEffect(() => {
    if (stage === 'BUG') {
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
    }
  }, [stage, playAlert]);

  useEffect(() => {
    if (stage === 'BUG' && timeLeft === 0) {
      playError();
      updateState({ phase: 'ENDING', ending: 'A' });
      onComplete();
    }
  }, [stage, timeLeft, playError, updateState, onComplete]);

  const handleFixBug = () => {
    playClick();
    const next = bugCount - 1;
    setBugCount(next);
    if (next <= 0) {
      playSuccess();
      updateState({ level: 'P3', phase: 'PURGATORY' });
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full p-6 relative z-10 items-center justify-center">
      <AnimatePresence mode="wait">
        {stage === 'SCHEDULE' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-2xl cyber-glass p-8 rounded-xl border border-[#B900FF]/50 text-center"
          >
            <h2 className="text-3xl font-bold neon-text-purple uppercase tracking-widest mb-6 text-[#B900FF]">
              {t('p2Title')}
            </h2>
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-[#16213E] rounded-full border-4 border-[#00E5FF] flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#00E5FF]">{t('p2You')}</span>
                </div>
                <span className="text-sm font-mono text-gray-400">{t('comm')}: {state.attributes.communication}</span>
              </div>

              <div className="flex-1 px-8">
                <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 mb-2">
                  <motion.div
                    className="h-full bg-[#FF003C]"
                    animate={{ width: `${rdHealth}%` }}
                    transition={{ type: 'spring' }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t('p2RdRes')}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-[#16213E] rounded-full border-4 border-[#FF003C] flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#FF003C]">{t('p2Rd')}</span>
                </div>
                <span className="text-sm font-mono text-gray-400">{t('p2RdQuote')}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-4 items-center">
              <button
                onClick={handleFight}
                disabled={state.attributes.communication < 5}
                className="bg-[#B900FF]/20 hover:bg-[#B900FF]/40 text-[#B900FF] border border-[#B900FF] px-8 py-3 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
              >
                {t('p2Argue')}
              </button>

              <button
                onClick={() => {
                  updateState({ attributes: { ...state.attributes, sanity: state.attributes.sanity - 20 } });
                  setStage('BUG');
                }}
                className="text-gray-500 hover:text-gray-300 font-mono text-sm underline transition-colors"
              >
                {t('p2Accept')}
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'BUG' && (
          <motion.div
            key="bug"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-[#FF003C]/10 animate-pulse pointer-events-none" />
            <h2 className="text-4xl font-bold neon-text-red uppercase tracking-widest mb-2 text-[#FF003C] flex items-center">
              <AlertTriangle className="mr-4" size={40} />
              {t('p2Outage')}
            </h2>
            <p className="text-xl font-mono text-white mb-8">{t('p2Rollback')}: 00:0{timeLeft}</p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {Array.from({ length: bugCount }).map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFixBug}
                  className="bg-[#16213E] border border-[#FF003C] p-6 rounded-lg flex items-center justify-center hover:bg-[#FF003C]/20 transition-colors"
                >
                  <Bug size={32} className="text-[#FF003C]" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
