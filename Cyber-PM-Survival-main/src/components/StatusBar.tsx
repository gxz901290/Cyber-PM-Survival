import React from 'react';
import { GameState } from '../types';
import { motion } from 'motion/react';
import { Brain, MessageSquare, Zap, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface StatusBarProps {
  state: GameState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ state }) => {
  const { attributes, level } = state;
  const isAnxious = attributes.sanity < 30;
  const { t } = useLanguage();

  return (
    <div className="w-full cyber-glass p-2 flex items-center justify-between border-b border-white/10 z-50 relative">
      <div className="flex items-center space-x-4">
        {/* Cyber PM Avatar */}
        <div className={`relative w-12 h-12 rounded-full border-2 ${isAnxious ? 'border-[#FF003C] shadow-[0_0_10px_#FF003C]' : 'border-[#00E5FF] shadow-[0_0_10px_#00E5FF]'} bg-[#16213E] overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors duration-300`}>
           <svg viewBox="0 0 100 100" className="w-full h-full">
             {/* Background/Hoodie */}
             <path d="M20 100 C 20 60, 80 60, 80 100" fill="#2A2A4A" />
             {/* Suit jacket lines */}
             <path d="M35 100 L 50 75 L 65 100" fill="none" stroke={isAnxious ? "#FF003C" : "#00E5FF"} strokeWidth="2" opacity="0.5" />
             {/* Head */}
             <circle cx="50" cy="45" r="25" fill="#FFE0BD" />
             {/* Cyber implant */}
             <path d="M70 35 L 75 45 L 70 55" fill="none" stroke="#E94560" strokeWidth="3" />
             <circle cx="72" cy="45" r="3" fill="#E94560" />
             {/* Visor / Eyes */}
             {isAnxious ? (
               <g>
                 {/* Sweating / Anxious */}
                 <path d="M35 40 Q 40 35 45 40" fill="none" stroke="#1A1A2E" strokeWidth="2" />
                 <path d="M55 40 Q 60 35 65 40" fill="none" stroke="#1A1A2E" strokeWidth="2" />
                 <circle cx="40" cy="45" r="2" fill="#1A1A2E" />
                 <circle cx="60" cy="45" r="2" fill="#1A1A2E" />
                 {/* Sweat drop */}
                 <path d="M80 30 Q 80 40 75 40 Q 70 40 70 30 Q 75 20 80 30" fill="#00E5FF" opacity="0.7" className="animate-bounce" />
                 {/* Mouth */}
                 <path d="M45 60 Q 50 55 55 60" fill="none" stroke="#1A1A2E" strokeWidth="2" />
               </g>
             ) : (
               <g>
                 {/* Confident Cyber Visor */}
                 <rect x="30" y="38" width="40" height="12" rx="4" fill="#1A1A2E" />
                 <rect x="32" y="40" width="36" height="8" rx="2" fill="#00E5FF" className="animate-pulse" />
                 {/* Mouth */}
                 <path d="M45 60 Q 50 65 55 60" fill="none" stroke="#1A1A2E" strokeWidth="2" />
               </g>
             )}
           </svg>
        </div>

        <div className="flex flex-col items-center justify-center bg-black/50 px-3 py-1 rounded border border-[#00E5FF]/30">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t('rank')}</span>
          <span className="text-lg font-bold neon-text-blue text-[#00E5FF]">{level}</span>
        </div>

        <div className="flex space-x-3">
          <AttributeBar icon={<Zap size={14} />} color="#00E5FF" value={attributes.owner} label={t('owner')} />
          <AttributeBar icon={<MessageSquare size={14} />} color="#B900FF" value={attributes.communication} label={t('comm')} />
          <AttributeBar icon={<Brain size={14} />} color="#FFD700" value={attributes.logic} label={t('logic')} />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t('brainMachine')}</span>
          <div className="flex items-center space-x-2">
            <ShieldAlert size={16} className={attributes.sanity < 30 ? 'text-[#FF003C] animate-pulse' : 'text-[#39FF14]'} />
            <motion.span 
              key={attributes.sanity}
              initial={{ scale: 1.5, color: '#fff' }}
              animate={{ scale: 1, color: attributes.sanity < 30 ? '#FF003C' : '#39FF14' }}
              className="font-mono font-bold text-lg"
            >
              {attributes.sanity}%
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttributeBar = ({ icon, color, value, label }: { icon: React.ReactNode, color: string, value: number, label: string }) => {
  return (
    <div className="flex flex-col w-20">
      <div className="flex items-center justify-between mb-1 text-[10px] text-gray-300">
        <span className="flex items-center space-x-1" style={{ color }}>
          {icon}
          <span>{label}</span>
        </span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ type: 'spring', stiffness: 50 }}
        />
      </div>
    </div>
  );
};
