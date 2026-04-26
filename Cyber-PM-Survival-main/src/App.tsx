import React, { useState, useEffect, useCallback } from 'react';
import { GameState, INITIAL_STATE } from './types';
import { StatusBar } from './components/StatusBar';
import { Phase1Interview } from './components/Phase1Interview';
import { Phase2Probation } from './components/Phase2Probation';
import { Phase3Purgatory } from './components/Phase3Purgatory';
import { Phase4Promotion } from './components/Phase4Promotion';
import { EndingScreen } from './components/EndingScreen';
import { LarkPopup } from './components/LarkPopup';
import { ABTestRoulette, ABResult } from './components/ABTestRoulette';
import { useLanguage } from './i18n/LanguageContext';
import { MatrixRain } from './components/MatrixRain';
import { useAudio } from './hooks/useAudio';
import { motion, AnimatePresence } from 'motion/react';
import { Play, MessageSquare } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [showLark, setShowLark] = useState(false);
  const [showAB, setShowAB] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const { playClick, initAudio, playTone } = useAudio();
  const { t, language, setLanguage } = useLanguage();

  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Random Events Logic
  useEffect(() => {
    if (state.phase === 'MENU' || state.phase === 'ENDING' || state.phase === 'INTERVIEW') return;

    const larkTimer = setInterval(() => {
      if (Math.random() < 0.3 && !showLark && !showAB) {
        setShowLark(true);
      }
    }, 15000);

    const abTimer = setInterval(() => {
      if (Math.random() < 0.2 && !showAB && !showLark) {
        setShowAB(true);
      }
    }, 25000);

    return () => {
      clearInterval(larkTimer);
      clearInterval(abTimer);
    };
  }, [state.phase, showLark, showAB]);

  const handleLarkRespond = (success: boolean) => {
    setShowLark(false);
    if (!success) {
      updateState({
        attributes: {
          ...state.attributes,
          sanity: Math.max(0, state.attributes.sanity - 15),
          owner: Math.max(0, state.attributes.owner - 10)
        }
      });
    } else {
      updateState({
        attributes: {
          ...state.attributes,
          owner: Math.min(100, state.attributes.owner + 5)
        }
      });
    }
  };

  const handleABComplete = (result: ABResult) => {
    setShowAB(false);
    if (result === 'SIGNIFICANT') {
      updateState({
        attributes: {
          ...state.attributes,
          logic: Math.min(100, state.attributes.logic + 15),
          cronyism: Math.min(100, state.attributes.cronyism + 10)
        }
      });
    } else if (result === 'NEGATIVE') {
      updateState({
        attributes: {
          ...state.attributes,
          sanity: Math.max(0, state.attributes.sanity - 20),
          cronyism: Math.max(0, state.attributes.cronyism - 10)
        }
      });
    }
  };

  // Check Sanity Death
  useEffect(() => {
    if (state.attributes.sanity <= 0 && state.phase !== 'ENDING') {
      updateState({ phase: 'ENDING', ending: 'D' });
    }
  }, [state.attributes.sanity, state.phase, updateState]);

  // Ambient hum on load
  useEffect(() => {
    if (state.phase === 'MENU') {
      // We can't auto-play audio without user interaction in most browsers,
      // but we can set it up for when they interact.
    }
  }, [state.phase]);

  const handleHoverStart = () => {
    playTone(150, 'sawtooth', 0.1, 0.02);
  };

  const startGame = () => {
    initAudio();
    playTone(400, 'square', 0.5, 0.1);
    setTimeout(() => playTone(600, 'sine', 0.8, 0.1), 200);
    
    setIsBooting(true);
    
    setTimeout(() => {
      setIsBooting(false);
      updateState({ phase: 'INTERVIEW' });
    }, 1500);
  };

  const restartGame = () => {
    setState(INITIAL_STATE);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-[#1A1A2E] flex flex-col items-center justify-center text-center p-6 portrait:flex landscape:hidden md:hidden">
        <h2 className="text-[#E94560] font-bold text-2xl mb-4 neon-text-pink uppercase">{t('systemError')}</h2>
        <p className="text-gray-300 font-mono">{t('rotateDevice')}</p>
        <div className="mt-8 w-16 h-16 border-4 border-[#00E5FF] rounded-full border-t-transparent animate-spin" />
      </div>
      <div className="w-screen h-screen bg-[#1A1A2E] text-white overflow-hidden relative crt hidden landscape:block md:block">
        <MatrixRain />
      
      {state.phase !== 'MENU' && state.phase !== 'ENDING' && (
        <StatusBar state={state} />
      )}

      <div className="w-full h-[calc(100vh-60px)] relative">
        <AnimatePresence mode="wait">
          {state.phase === 'MENU' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full z-10 relative px-4"
            >
              {/* Easter Eggs */}
              <motion.div 
                animate={{ opacity: [0.2, 0.8, 0.1, 0.5] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute top-10 left-10 cyber-glass p-2 rounded border border-[#E94560]/30 flex items-center space-x-2 pointer-events-none"
              >
                <MessageSquare size={12} className="text-[#E94560]" />
                <span className="text-[10px] font-mono text-[#E94560]">{t('easterEggLark')}</span>
              </motion.div>
              
              <div className="absolute bottom-10 right-10 text-[10px] font-mono text-[#00E5FF]/30 pointer-events-none">
                {t('easterEggRank')}
              </div>

              <motion.h1 
                animate={{ textShadow: ["0 0 5px #00E5FF", "0 0 20px #00E5FF", "0 0 5px #00E5FF"] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-6xl md:text-8xl font-bold text-[#00E5FF] mb-2 text-center tracking-tighter"
              >
                {t('title1')}
              </motion.h1>
              <motion.h2 
                animate={{ opacity: [1, 0.5, 1, 1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, times: [0, 0.1, 0.2, 0.8, 0.9, 1] }}
                className="text-2xl md:text-4xl text-[#FF003C] font-mono mb-8 tracking-widest neon-text-red"
              >
                {t('title2')}
              </motion.h2>
              
              <div className="max-w-2xl mb-12 overflow-hidden h-20 relative">
                <motion.p 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-gray-400 font-mono text-sm md:text-base text-center leading-relaxed"
                >
                  {t('introText')}
                </motion.p>
              </div>
              
              <motion.button
                onHoverStart={handleHoverStart}
                onClick={startGame}
                whileHover={{ y: -5, boxShadow: "0 0 20px #00E5FF, inset 0 0 10px #00E5FF" }}
                whileTap={{ scale: 0.95, x: [0, -5, 5, -5, 5, 0] }}
                className="group relative inline-flex items-center justify-center px-12 py-6 font-bold text-white transition-all duration-200 bg-transparent border-2 border-[#00E5FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00E5FF] uppercase tracking-widest text-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/20 to-[#00E5FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Play className="mr-4 text-[#00E5FF] group-hover:animate-pulse" size={28} />
                <span className="neon-text-blue">{t('startBtn')}</span>
              </motion.button>

              {/* Language Selection Buttons */}
              <div className="flex space-x-6 mt-12">
                <button
                  onClick={() => { playClick(); setLanguage('en'); }}
                  className={`px-8 py-3 font-mono text-sm border-2 transition-all duration-300 rounded-md ${language === 'en' ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'border-gray-600 text-gray-400 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]/80 bg-black/40'}`}
                >
                  ENGLISH
                </button>
                <button
                  onClick={() => { playClick(); setLanguage('zh'); }}
                  className={`px-8 py-3 font-mono text-sm border-2 transition-all duration-300 rounded-md ${language === 'zh' ? 'border-[#E94560] text-[#E94560] bg-[#E94560]/20 shadow-[0_0_15px_rgba(233,69,96,0.5)]' : 'border-gray-600 text-gray-400 hover:border-[#E94560]/50 hover:text-[#E94560]/80 bg-black/40'}`}
                >
                  简体中文
                </button>
              </div>
            </motion.div>
          )}

          {state.phase === 'INTERVIEW' && (
            <Phase1Interview key="interview" state={state} updateState={updateState} onComplete={() => {}} />
          )}

          {state.phase === 'PROBATION' && (
            <Phase2Probation key="probation" state={state} updateState={updateState} onComplete={() => {}} />
          )}

          {state.phase === 'PURGATORY' && (
            <Phase3Purgatory key="purgatory" state={state} updateState={updateState} onComplete={() => {}} />
          )}

          {state.phase === 'PROMOTION' && (
            <Phase4Promotion key="promotion" state={state} updateState={updateState} onComplete={() => {}} />
          )}
        </AnimatePresence>
      </div>

      {showLark && <LarkPopup onRespond={handleLarkRespond} />}
      {showAB && <ABTestRoulette onComplete={handleABComplete} />}
      
      {state.phase === 'ENDING' && (
        <EndingScreen state={state} onRestart={restartGame} />
      )}

      {/* Booting Overlay */}
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.5, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-1 bg-[#00E5FF] shadow-[0_0_20px_#00E5FF]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
