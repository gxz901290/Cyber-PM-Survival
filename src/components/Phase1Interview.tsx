import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../i18n/LanguageContext';
import { Cpu, CheckCircle, XCircle } from 'lucide-react';

interface Phase1Props {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  onComplete: () => void;
}

export const Phase1Interview: React.FC<Phase1Props> = ({ state, updateState, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const { playClick, playSuccess, playError } = useAudio();
  const { t } = useLanguage();

  const QUESTIONS = [
    {
      q: t('p1Q1'),
      options: [
        { text: t('p1Q1O1'), score: 1.5, attr: 'logic' },
        { text: t('p1Q1O2'), score: 0.5, attr: 'cronyism' },
        { text: t('p1Q1O3'), score: 0, attr: 'sanity' }
      ]
    },
    {
      q: t('p1Q2'),
      options: [
        { text: t('p1Q2O1'), score: 0.5, attr: 'sanity' },
        { text: t('p1Q2O2'), score: 1.5, attr: 'communication' },
        { text: t('p1Q2O3'), score: 1.0, attr: 'owner' }
      ]
    },
    {
      q: t('p1Q3'),
      options: [
        { text: t('p1Q3O1'), score: 0, attr: 'cronyism' },
        { text: t('p1Q3O2'), score: 1.5, attr: 'logic' },
        { text: t('p1Q3O3'), score: 1.0, attr: 'cronyism' }
      ]
    }
  ];

  const handleAnswer = (option: typeof QUESTIONS[0]['options'][0]) => {
    playClick();
    const newScore = score + option.score;
    setScore(newScore);

    // Update attributes based on answer
    const attrUpdates: any = { ...state.attributes };
    if (option.attr === 'logic') attrUpdates.logic += 10;
    if (option.attr === 'communication') attrUpdates.communication += 10;
    if (option.attr === 'owner') attrUpdates.owner += 10;
    if (option.attr === 'cronyism') attrUpdates.cronyism += 10;
    if (option.attr === 'sanity') attrUpdates.sanity -= 10;

    updateState({ attributes: attrUpdates });

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      // Finish interview
      setTimeout(() => {
        if (newScore >= 3.5) {
          playSuccess();
          updateState({ level: 'P2', phase: 'PROBATION' });
        } else {
          playError();
          updateState({ phase: 'ENDING', ending: 'A' });
        }
        onComplete();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold neon-text-blue uppercase tracking-widest mb-2">{t('p1Title')}</h1>
        <p className="text-gray-400 font-mono text-sm">{t('p1Target')}</p>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="cyber-glass p-6 rounded-xl border border-[#00E5FF]/30 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50" />
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#16213E] border-2 border-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.5)]">
              <Cpu className="text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-[#00E5FF] font-bold uppercase text-sm tracking-widest">{t('p1Interviewer')}</h3>
              <p className="text-gray-400 text-xs font-mono">ID: HR-9000</p>
            </div>
          </div>
          <p className="text-xl font-medium leading-relaxed">"{QUESTIONS[currentQ].q}"</p>
        </motion.div>

        <div className="space-y-4">
          {QUESTIONS[currentQ].options.map((opt, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, x: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(opt)}
              className="w-full text-left p-4 cyber-glass border border-white/10 hover:border-[#00E5FF]/50 rounded-lg group transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/5 to-[#00E5FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="font-mono text-[#00E5FF] mr-4 opacity-50 group-hover:opacity-100 transition-opacity">[{idx + 1}]</span>
              <span className="text-gray-200 group-hover:text-white transition-colors">{opt.text}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 font-mono text-sm text-gray-500">
        {t('question')} {currentQ + 1} / {QUESTIONS.length}
      </div>
    </div>
  );
};
