import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../i18n/LanguageContext';
import { MessageSquare, Target, Zap } from 'lucide-react';

interface Phase3Props {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  onComplete: () => void;
}

export const Phase3Purgatory: React.FC<Phase3Props> = ({ state, updateState, onComplete }) => {
  const [stage, setStage] = useState<'SCOPE' | 'CHAT'>('SCOPE');
  const [scopeProgress, setScopeProgress] = useState(0);
  const [chatIndex, setChatIndex] = useState(0);
  const { playClick, playSuccess, playError } = useAudio();
  const { t } = useLanguage();

  const CHAT_SCENARIOS = [
    {
      msg: t('p3Chat101'),
      options: [
        { text: t('p3C1O1'), sanity: -5, cronyism: -10, owner: -10 },
        { text: t('p3C1O2'), sanity: -15, cronyism: 10, owner: 20 },
        { text: t('p3C1O3'), sanity: -5, cronyism: 5, owner: 5 }
      ]
    },
    {
      msg: t('p3Chat102'),
      options: [
        { text: t('p3C1O1'), sanity: -5, cronyism: -10, owner: -10 },
        { text: t('p3C1O2'), sanity: -15, cronyism: 10, owner: 20 },
        { text: t('p3C1O3'), sanity: -5, cronyism: 5, owner: 5 }
      ]
    },
    {
      msg: t('p3Chat103'),
      options: [
        { text: t('p3C1O1'), sanity: -5, cronyism: -10, owner: -10 },
        { text: t('p3C1O2'), sanity: -15, cronyism: 10, owner: 20 },
        { text: t('p3C1O3'), sanity: -5, cronyism: 5, owner: 5 }
      ]
    }
  ];

  const handleGrabScope = () => {
    playClick();
    if (state.attributes.logic >= 10 && state.attributes.communication >= 10) {
      updateState({
        attributes: {
          ...state.attributes,
          logic: state.attributes.logic - 10,
          communication: state.attributes.communication - 10,
          cronyism: state.attributes.cronyism + 15
        }
      });
      const next = scopeProgress + 34;
      setScopeProgress(next);
      if (next >= 100) {
        playSuccess();
        setTimeout(() => setStage('CHAT'), 1000);
      }
    } else {
      playError();
    }
  };

  const handleChatResponse = (option: typeof CHAT_SCENARIOS[0]['options'][0]) => {
    playClick();
    updateState({
      attributes: {
        ...state.attributes,
        sanity: Math.max(0, state.attributes.sanity + option.sanity),
        cronyism: Math.min(100, state.attributes.cronyism + option.cronyism),
        owner: Math.min(100, state.attributes.owner + option.owner)
      }
    });

    if (chatIndex < CHAT_SCENARIOS.length - 1) {
      setChatIndex(prev => prev + 1);
    } else {
      playSuccess();
      updateState({ level: 'P5', phase: 'PROMOTION' });
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full p-6 relative z-10 items-center justify-center">
      <AnimatePresence mode="wait">
        {stage === 'SCOPE' && (
          <motion.div
            key="scope"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl cyber-glass p-8 rounded-xl border border-[#FFD700]/50 text-center"
          >
            <h2 className="text-3xl font-bold neon-text-gold uppercase tracking-widest mb-6 text-[#FFD700] flex items-center justify-center">
              <Target className="mr-3" /> {t('p3Title')}
            </h2>
            <p className="text-gray-400 font-mono mb-8">
              {t('p3Desc')}
            </p>

            <div className="w-full h-6 bg-black/50 rounded-full overflow-hidden border border-white/10 mb-8 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FFD700]/50 to-[#FFD700]"
                animate={{ width: `${scopeProgress}%` }}
                transition={{ type: 'spring' }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white mix-blend-difference">
                {Math.round(scopeProgress)}%
              </span>
            </div>

            <div className="flex flex-col space-y-4 items-center">
              <button
                onClick={handleGrabScope}
                disabled={state.attributes.logic < 10 || state.attributes.communication < 10}
                className="bg-[#FFD700]/20 hover:bg-[#FFD700]/40 text-[#FFD700] border border-[#FFD700] px-8 py-3 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full max-w-xs"
              >
                <Zap className="mr-2" size={18} />
                {t('p3Report')}
              </button>

              <button
                onClick={() => setStage('CHAT')}
                className="text-gray-500 hover:text-gray-300 font-mono text-sm underline transition-colors"
              >
                {t('p3GiveUp')}
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'CHAT' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl cyber-glass rounded-xl border border-[#00E5FF]/50 overflow-hidden flex flex-col h-[80%]"
          >
            <div className="bg-[#16213E] p-4 border-b border-white/10 flex items-center">
              <MessageSquare className="text-[#00E5FF] mr-3" />
              <h3 className="text-[#00E5FF] font-bold uppercase tracking-widest">{t('p3Lark')}</h3>
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-end space-y-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 p-4 rounded-lg border border-white/5 self-start max-w-[80%]"
              >
                <p className="text-gray-200 font-mono">{CHAT_SCENARIOS[chatIndex].msg}</p>
              </motion.div>
            </div>

            <div className="p-4 bg-[#16213E] border-t border-white/10 grid grid-cols-1 gap-3">
              {CHAT_SCENARIOS[chatIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChatResponse(opt)}
                  className="text-left px-4 py-3 bg-black/30 hover:bg-[#00E5FF]/20 border border-white/10 hover:border-[#00E5FF]/50 rounded text-sm font-mono text-gray-300 hover:text-white transition-colors flex justify-between items-center"
                >
                  <span>{opt.text}</span>
                  <span className="text-xs text-gray-500">
                    [{t('sanity')} {opt.sanity > 0 ? '+' : ''}{opt.sanity}]
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
