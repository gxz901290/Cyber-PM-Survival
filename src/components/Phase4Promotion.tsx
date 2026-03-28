import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../i18n/LanguageContext';
import { Presentation, ShieldAlert, Clock, HelpCircle, SkipForward } from 'lucide-react';

interface Phase4Props {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  onComplete: () => void;
}

export const Phase4Promotion: React.FC<Phase4Props> = ({ state, updateState, onComplete }) => {
  const [stage, setStage] = useState<'INTRO' | 'PPT' | 'SOUL_QUESTION' | 'DEFENSE'>('INTRO');
  const [slideIndex, setSlideIndex] = useState(0);
  const [filledWords, setFilledWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [patience, setPatience] = useState(100);
  const [approval, setApproval] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const [skepticComment, setSkepticComment] = useState<string | null>(null);
  
  const { playClick, playSuccess, playError, playAlert, playTone } = useAudio();
  const { t, language } = useLanguage();

  const BUZZWORDS = [
    { word: t('bw1'), tip: t('bw1Tip') },
    { word: t('bw2'), tip: t('bw2Tip') },
    { word: t('bw3'), tip: t('bw3Tip') },
    { word: t('bw4'), tip: t('bw4Tip') },
    { word: t('bw5'), tip: t('bw5Tip') },
    { word: t('bw6'), tip: t('bw6Tip') }
  ];

  const PPT_SLIDES = [
    {
      title: t('slide1Title'),
      text: t('slide1Text'),
      blanks: 3,
      correct: [t('bw5'), t('bw1'), t('bw4')] // Leverage, Empower, Closed Loop
    },
    {
      title: t('slide2Title'),
      text: t('slide2Text'),
      blanks: 3,
      correct: [t('bw2'), t('bw3'), t('bw6')] // Align, Feedback, Strategy
    }
  ];

  // Timer logic
  useEffect(() => {
    if (stage !== 'PPT') return;
    
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      if (timeLeft <= 5) {
        playTone(800, 'square', 0.1, 0.05); // Ticking sound
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  // Random skeptic comments
  useEffect(() => {
    if (stage !== 'PPT') return;
    
    const comments = [t('p4Skeptic1'), t('p4Skeptic2'), t('p4Skeptic3')];
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setSkepticComment(comments[Math.floor(Math.random() * comments.length)]);
        setTimeout(() => setSkepticComment(null), 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [stage, t]);

  const handleTimeout = () => {
    playError();
    triggerGlitch();
    setPatience(prev => Math.max(0, prev - 20));
    updateState({
      attributes: {
        ...state.attributes,
        sanity: Math.max(0, state.attributes.sanity - 10)
      }
    });
    advanceSlide();
  };

  const triggerGlitch = () => {
    setShowGlitch(true);
    setTimeout(() => setShowGlitch(false), 500);
  };

  const handleWordSelect = (word: string) => {
    playClick();
    if (filledWords.length < PPT_SLIDES[slideIndex].blanks) {
      setFilledWords([...filledWords, word]);
    }
  };

  const handleClear = () => {
    playClick();
    setFilledWords([]);
  };

  const handleSkip = () => {
    if (state.attributes.communication >= 15) {
      playClick();
      updateState({
        attributes: {
          ...state.attributes,
          communication: state.attributes.communication - 15
        }
      });
      advanceSlide();
    } else {
      playError();
    }
  };

  const handleHint = () => {
    if (state.attributes.logic >= 10 && filledWords.length < PPT_SLIDES[slideIndex].blanks) {
      playSuccess();
      updateState({
        attributes: {
          ...state.attributes,
          logic: state.attributes.logic - 10
        }
      });
      const currentSlide = PPT_SLIDES[slideIndex];
      const nextCorrectWord = currentSlide.correct[filledWords.length];
      setFilledWords([...filledWords, nextCorrectWord]);
    } else {
      playError();
    }
  };

  const handleSubmitSlide = () => {
    const currentSlide = PPT_SLIDES[slideIndex];
    let correctCount = 0;
    filledWords.forEach((word, idx) => {
      if (word === currentSlide.correct[idx]) correctCount++;
    });

    if (correctCount === currentSlide.blanks) {
      playSuccess();
      setApproval(prev => Math.min(100, prev + 50));
      updateState({
        attributes: {
          ...state.attributes,
          cronyism: Math.min(100, state.attributes.cronyism + 10)
        }
      });
      advanceSlide();
    } else {
      playError();
      triggerGlitch();
      setPatience(prev => Math.max(0, prev - 15));
      updateState({
        attributes: {
          ...state.attributes,
          sanity: Math.max(0, state.attributes.sanity - 10)
        }
      });
      setStage('SOUL_QUESTION');
    }
  };

  const advanceSlide = () => {
    if (slideIndex < PPT_SLIDES.length - 1) {
      setSlideIndex(prev => prev + 1);
      setFilledWords([]);
      setTimeLeft(15);
    } else {
      setStage('DEFENSE');
    }
  };

  const handleSoulQuestion = (correct: boolean) => {
    if (correct) {
      playSuccess();
      setApproval(prev => Math.min(100, prev + 20));
    } else {
      playError();
      triggerGlitch();
      setPatience(prev => Math.max(0, prev - 25));
      updateState({
        attributes: {
          ...state.attributes,
          sanity: Math.max(0, state.attributes.sanity - 20)
        }
      });
    }
    advanceSlide();
    setStage('PPT');
  };

  const handleDefense = (action: 'LOGIC' | 'COMM' | 'CRONY') => {
    playClick();
    let damage = 0;
    let newPatience = patience;

    if (action === 'LOGIC' && state.attributes.logic >= 20) {
      damage = 30;
      updateState({ attributes: { ...state.attributes, logic: state.attributes.logic - 20 } });
    } else if (action === 'COMM' && state.attributes.communication >= 20) {
      damage = 25;
      updateState({ attributes: { ...state.attributes, communication: state.attributes.communication - 20 } });
    } else if (action === 'CRONY' && state.attributes.cronyism >= 50) {
      damage = 50; // Boss buff
      playAlert();
    } else {
      playError();
      updateState({ attributes: { ...state.attributes, sanity: state.attributes.sanity - 15 } });
      return;
    }

    newPatience = Math.max(0, patience - damage);
    setPatience(newPatience);

    if (newPatience <= 0 || approval >= 100) {
      playSuccess();
      // Determine ending
      let ending: 'A' | 'B' | 'C' | 'D' = 'A';
      let finalLevel = state.level;
      if (state.attributes.sanity <= 0) ending = 'D';
      else if (state.attributes.cronyism >= 80) { ending = 'B'; finalLevel = 'P7'; }
      else if (state.attributes.logic >= 80 && state.attributes.communication >= 80 && state.attributes.owner >= 80) { ending = 'C'; finalLevel = 'P7'; }
      else ending = 'A';

      updateState({ phase: 'ENDING', ending, level: finalLevel });
      onComplete();
    }
  };

  const renderTextWithBlanks = () => {
    const slide = PPT_SLIDES[slideIndex];
    const parts = slide.text.split('[___]');
    return parts.map((part, idx) => (
      <React.Fragment key={idx}>
        {part}
        {idx < parts.length - 1 && (
          <span className="inline-block min-w-[120px] border-b-2 border-[#00E5FF] mx-2 text-center text-[#00E5FF] font-bold px-2 py-1 bg-[#00E5FF]/10">
            {filledWords[idx] || '...'}
          </span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex flex-col h-full p-6 relative z-10 items-center justify-center ${showGlitch ? 'glitch-hover' : ''}`}>
      <AnimatePresence mode="wait">
        {stage === 'INTRO' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl cyber-glass p-8 rounded-xl border border-[#00E5FF]/50 text-center"
          >
            <h2 className="text-3xl font-bold neon-text-blue uppercase tracking-widest mb-6 text-[#00E5FF]">
              {t('p4Title')}
            </h2>
            <p className="text-gray-300 font-mono mb-8 leading-relaxed">
              {t('p4Intro')}
            </p>
            <button
              onClick={() => { playClick(); setStage('PPT'); }}
              className="bg-[#00E5FF]/20 hover:bg-[#00E5FF]/40 text-[#00E5FF] border border-[#00E5FF] px-8 py-3 rounded font-bold uppercase tracking-widest transition-all"
            >
              {t('p4EnterRoom')}
            </button>
          </motion.div>
        )}

        {stage === 'PPT' && (
          <motion.div
            key="ppt"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left Panel: Judges & Context */}
            <div className="col-span-1 flex flex-col space-y-4">
              <div className="cyber-glass p-4 rounded-lg border border-white/10 relative overflow-hidden">
                <h3 className="text-[#FFD700] font-bold text-sm uppercase tracking-widest mb-2 flex items-center">
                  <ShieldAlert size={14} className="mr-2" /> {t('p4Judges')}
                </h3>
                
                {skepticComment && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 right-2 bg-black/80 border border-[#FF003C] text-[#FF003C] text-[10px] p-1 rounded font-mono z-20"
                  >
                    {skepticComment}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>{t('p4Patience')}</span>
                      <span>{patience}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#FF003C]" animate={{ width: `${patience}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>{t('p4Approval')}</span>
                      <span>{approval}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#39FF14]" animate={{ width: `${approval}%` }} />
                    </div>
                  </div>
                </div>
                
                {/* Holographic Judge Avatars */}
                <div className="flex justify-around mt-4 opacity-70">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border border-[#00E5FF] bg-[#00E5FF]/20 flex items-center justify-center animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                      <span className="text-[10px] font-mono text-[#00E5FF]">P{i+7}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cyber-glass p-4 rounded-lg border border-white/10">
                <h3 className="text-[#00E5FF] font-bold text-xs uppercase tracking-widest mb-2">{t('p4Context')}</h3>
                <p className="text-[10px] text-gray-400 font-mono">{t('p4Project')}</p>
              </div>
            </div>

            {/* Right Panel: PPT & Controls */}
            <div className="col-span-2 cyber-glass p-6 rounded-xl border border-[#00E5FF]/50 flex flex-col relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h2 className="text-xl font-bold neon-text-blue uppercase tracking-widest text-[#00E5FF] flex items-center">
                  <Presentation className="mr-2" size={20} /> {t('p4Slide')} {slideIndex + 1}/{PPT_SLIDES.length}
                </h2>
                <div className={`flex items-center space-x-2 font-mono font-bold ${timeLeft <= 5 ? 'text-[#FF003C] animate-pulse' : 'text-[#00E5FF]'}`}>
                  <Clock size={16} />
                  <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
              </div>

              <div className="bg-[#16213E] p-6 rounded-lg border border-white/5 mb-6 min-h-[120px] text-base leading-relaxed font-mono flex-grow">
                <h3 className="text-[#FFD700] font-bold mb-4 text-sm">{PPT_SLIDES[slideIndex].title}</h3>
                <p className="text-gray-200">{renderTextWithBlanks()}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 relative">
                {BUZZWORDS.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="relative"
                    onMouseEnter={() => setHoveredWord(item.word)}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    <button
                      onClick={() => handleWordSelect(item.word)}
                      disabled={filledWords.length >= PPT_SLIDES[slideIndex].blanks}
                      className="w-full bg-black/30 hover:bg-[#00E5FF]/20 text-gray-300 hover:text-white border border-white/10 hover:border-[#00E5FF]/50 px-2 py-2 rounded text-xs font-mono transition-colors disabled:opacity-50 truncate"
                    >
                      {item.word}
                    </button>
                    {hoveredWord === item.word && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black/90 border border-[#E94560] text-[#E94560] text-[10px] p-2 rounded z-50 font-mono shadow-[0_0_10px_rgba(233,69,96,0.5)]">
                        {item.tip}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-auto">
                <div className="flex space-x-2">
                  <button onClick={handleClear} className="text-gray-400 hover:text-white font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-transparent hover:border-gray-500 rounded">
                    {t('p4Clear')}
                  </button>
                  <button onClick={handleHint} disabled={state.attributes.logic < 10 || filledWords.length >= PPT_SLIDES[slideIndex].blanks} title={state.attributes.logic < 10 ? t('p4HintDisabled') : ""} className="text-[#FFD700] hover:bg-[#FFD700]/10 font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-[#FFD700]/30 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <HelpCircle size={12} className="mr-1" /> {t('p4Hint')}
                  </button>
                  <button onClick={handleSkip} disabled={state.attributes.communication < 15} title={state.attributes.communication < 15 ? t('p4SkipDisabled') : ""} className="text-[#B900FF] hover:bg-[#B900FF]/10 font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-[#B900FF]/30 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <SkipForward size={12} className="mr-1" /> {t('p4Skip')}
                  </button>
                </div>
                <button
                  onClick={handleSubmitSlide}
                  disabled={filledWords.length < PPT_SLIDES[slideIndex].blanks}
                  className="bg-[#00E5FF]/20 hover:bg-[#00E5FF]/40 text-[#00E5FF] border border-[#00E5FF] px-6 py-2 rounded text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {t('p4Submit')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'SOUL_QUESTION' && (
          <motion.div
            key="soul"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl cyber-glass p-8 rounded-xl border border-[#FF003C]/50 text-center glitch-hover"
          >
            <h2 className="text-2xl font-bold neon-text-red uppercase tracking-widest mb-6 text-[#FF003C]">
              {t('p4SoulQ')}
            </h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleSoulQuestion(true)}
                className="bg-black/50 hover:bg-[#39FF14]/20 text-gray-300 hover:text-[#39FF14] border border-white/10 hover:border-[#39FF14] p-4 rounded font-mono transition-all text-left"
              >
                {t('p4SoulO1')}
              </button>
              <button
                onClick={() => handleSoulQuestion(false)}
                className="bg-black/50 hover:bg-[#FF003C]/20 text-gray-300 hover:text-[#FF003C] border border-white/10 hover:border-[#FF003C] p-4 rounded font-mono transition-all text-left"
              >
                {t('p4SoulO2')}
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'DEFENSE' && (
          <motion.div
            key="defense"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl cyber-glass p-8 rounded-xl border border-[#FF003C]/50 text-center"
          >
            <h2 className="text-3xl font-bold neon-text-red uppercase tracking-widest mb-6 text-[#FF003C] flex items-center justify-center">
              <ShieldAlert className="mr-3" size={32} /> {t('p4DefenseTitle')}
            </h2>
            <p className="text-gray-400 font-mono mb-8">
              {t('p4DefenseDesc')}
            </p>

            <div className="mb-8">
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">
                <span>{t('p4Patience')}</span>
                <span>{patience}%</span>
              </div>
              <div className="h-6 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF003C]/50 to-[#FF003C]"
                  animate={{ width: `${patience}%` }}
                  transition={{ type: 'spring' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleDefense('LOGIC')}
                disabled={state.attributes.logic < 20}
                className="bg-[#FFD700]/20 hover:bg-[#FFD700]/40 text-[#FFD700] border border-[#FFD700] px-6 py-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex justify-between items-center"
              >
                <span>{t('p4DefenseLogic')}</span>
                <span className="text-xs font-mono opacity-70">-20 Logic</span>
              </button>
              <button
                onClick={() => handleDefense('COMM')}
                disabled={state.attributes.communication < 20}
                className="bg-[#B900FF]/20 hover:bg-[#B900FF]/40 text-[#B900FF] border border-[#B900FF] px-6 py-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex justify-between items-center"
              >
                <span>{t('p4DefenseComm')}</span>
                <span className="text-xs font-mono opacity-70">-20 Comm</span>
              </button>
              <button
                onClick={() => handleDefense('CRONY')}
                disabled={state.attributes.cronyism < 50}
                className="bg-[#00E5FF]/20 hover:bg-[#00E5FF]/40 text-[#00E5FF] border border-[#00E5FF] px-6 py-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex justify-between items-center"
              >
                <span>{t('p4DefenseCrony')}</span>
                <span className="text-xs font-mono opacity-70">{t('p4DefenseCronyReq')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
