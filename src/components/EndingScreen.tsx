import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../i18n/LanguageContext';
import { RefreshCw, Trophy, Skull, Crown, Plane } from 'lucide-react';

interface EndingScreenProps {
  state: GameState;
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ state, onRestart }) => {
  const { playSuccess, playError } = useAudio();
  const { t } = useLanguage();

  const ENDINGS = {
    A: {
      title: t('endA'),
      desc: t('endADesc'),
      icon: Skull,
      color: "#FF003C",
      bg: "grayscale"
    },
    B: {
      title: t('endB'),
      desc: t('endBDesc'),
      icon: Crown,
      color: "#FFD700",
      bg: "bg-gradient-to-br from-[#FFD700]/20 to-[#B900FF]/20"
    },
    C: {
      title: t('endC'),
      desc: t('endCDesc'),
      icon: Trophy,
      color: "#00E5FF",
      bg: "bg-gradient-to-br from-[#00E5FF]/20 to-[#39FF14]/20"
    },
    D: {
      title: t('endD'),
      desc: t('endDDesc'),
      icon: Plane,
      color: "#39FF14",
      bg: "bg-gradient-to-br from-[#39FF14]/20 to-transparent"
    }
  };

  const ending = ENDINGS[state.ending || 'A'];
  const Icon = ending.icon;

  useEffect(() => {
    if (state.ending === 'A' || state.ending === 'D') {
      playError();
    } else {
      playSuccess();
    }
  }, [state.ending, playError, playSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${ending.bg} backdrop-blur-md`}
    >
      <div className="absolute inset-0 matrix-bg opacity-10" />
      
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="cyber-glass p-12 rounded-2xl border border-white/20 max-w-2xl w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: ending.color }} />
        
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="w-32 h-32 mx-auto mb-8 rounded-full border-4 flex items-center justify-center bg-black/50"
          style={{ borderColor: ending.color, boxShadow: `0 0 30px ${ending.color}` }}
        >
          <Icon size={64} style={{ color: ending.color }} />
        </motion.div>

        <h1 className="text-5xl font-bold uppercase tracking-widest mb-4" style={{ color: ending.color, textShadow: `0 0 20px ${ending.color}` }}>
          {ending.title}
        </h1>
        
        <p className="text-xl text-gray-300 font-mono leading-relaxed mb-12">
          {ending.desc}
        </p>

        <div className="grid grid-cols-2 gap-4 text-left font-mono text-sm text-gray-400 mb-12 bg-black/40 p-6 rounded-lg border border-white/5">
          <div>{t('endFinalRank')}: <span className="text-white font-bold">{state.level}</span></div>
          <div>{t('sanity')}: <span className="text-white font-bold">{state.attributes.sanity}%</span></div>
          <div>{t('logic')}: <span className="text-[#FFD700] font-bold">{state.attributes.logic}</span></div>
          <div>{t('comm')}: <span className="text-[#B900FF] font-bold">{state.attributes.communication}</span></div>
          <div>{t('owner')}: <span className="text-[#00E5FF] font-bold">{state.attributes.owner}</span></div>
          <div>{t('cronyism')}: <span className="text-white font-bold opacity-50">{t('endClassified')}</span></div>
        </div>

        <button
          onClick={onRestart}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent border-2 border-white/20 rounded-lg hover:bg-white/10 hover:border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white uppercase tracking-widest"
        >
          <RefreshCw className="mr-3 group-hover:rotate-180 transition-transform duration-500" />
          {t('endRestart')}
        </button>
      </motion.div>
    </motion.div>
  );
};
