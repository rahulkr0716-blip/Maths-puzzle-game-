/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Gamepad2, Trees, Rocket, Check, Settings } from 'lucide-react';
import { sound } from '../utils/sound';
import { SoundTheme, Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SoundToggleProps {
  difficulty?: Difficulty;
  onDifficultyChange?: (diff: Difficulty) => void;
}

export default function SoundToggle({ difficulty = 'medium', onDifficultyChange }: SoundToggleProps) {
  const [muted, setMuted] = useState(sound.getMuteState());
  const [currentTheme, setCurrentTheme] = useState<SoundTheme>(sound.getTheme());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const bar3Ref = useRef<HTMLDivElement>(null);
  const bar4Ref = useRef<HTMLDivElement>(null);

  const themeColorClass = 
    currentTheme === 'classic' ? 'bg-sky-500' :
    currentTheme === 'jungle' ? 'bg-emerald-500' :
    'bg-purple-500';

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Equalizer animation effect
  useEffect(() => {
    if (muted) return;

    let animationFrameId: number;
    let h1 = 3;
    let h2 = 3;
    let h3 = 3;
    let h4 = 3;

    const updateBars = () => {
      const analyser = sound.getAnalyser();
      const nowMs = performance.now();

      let targetH1 = 3;
      let targetH2 = 3;
      let targetH3 = 3;
      let targetH4 = 3;

      if (analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const sum = dataArray.reduce((acc, val) => acc + val, 0);

        if (sum > 0) {
          // Real-time frequency analysis response
          targetH1 = Math.max(3, (dataArray[1] / 255) * 16);
          targetH2 = Math.max(3, (dataArray[3] / 255) * 16);
          targetH3 = Math.max(3, (dataArray[5] / 255) * 16);
          targetH4 = Math.max(3, (dataArray[7] / 255) * 16);
        } else {
          // Low energy idle visualization breathing loop
          targetH1 = 3 + Math.abs(Math.sin(nowMs * 0.004)) * 5;
          targetH2 = 3 + Math.abs(Math.sin(nowMs * 0.004 + 1.2)) * 5;
          targetH3 = 3 + Math.abs(Math.sin(nowMs * 0.004 + 2.4)) * 5;
          targetH4 = 3 + Math.abs(Math.sin(nowMs * 0.004 + 3.6)) * 5;
        }
      } else {
        // Idle visualization breathing loop
        targetH1 = 3 + Math.abs(Math.sin(nowMs * 0.004)) * 5;
        targetH2 = 3 + Math.abs(Math.sin(nowMs * 0.004 + 1.2)) * 5;
        targetH3 = 3 + Math.abs(Math.sin(nowMs * 0.004 + 2.4)) * 5;
        targetH4 = 3 + Math.abs(Math.sin(nowMs * 0.004 + 3.6)) * 5;
      }

      // Linear interpolation smoothing filter for fluid visual transitions
      h1 += (targetH1 - h1) * 0.35;
      h2 += (targetH2 - h2) * 0.35;
      h3 += (targetH3 - h3) * 0.35;
      h4 += (targetH4 - h4) * 0.35;

      if (bar1Ref.current) bar1Ref.current.style.height = `${h1}px`;
      if (bar2Ref.current) bar2Ref.current.style.height = `${h2}px`;
      if (bar3Ref.current) bar3Ref.current.style.height = `${h3}px`;
      if (bar4Ref.current) bar4Ref.current.style.height = `${h4}px`;

      animationFrameId = requestAnimationFrame(updateBars);
    };

    updateBars();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [muted]);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMute = sound.toggleMute();
    setMuted(nextMute);
    if (!nextMute) {
      sound.playTap();
    }
  };

  const handleThemeSelect = (theme: SoundTheme, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.setTheme(theme);
    setCurrentTheme(theme);
    // playTap inside sound.setTheme will preview it!
  };

  const themes: { id: SoundTheme; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'classic',
      label: 'Classic 🎮',
      icon: <Gamepad2 className="w-4 h-4 text-sky-500" />,
      color: 'hover:bg-sky-50 text-sky-950',
      desc: 'Beeps and chiptunes'
    },
    {
      id: 'jungle',
      label: 'Jungle 🌴',
      icon: <Trees className="w-4 h-4 text-emerald-500" />,
      color: 'hover:bg-emerald-50 text-emerald-950',
      desc: 'Birds & woodblocks'
    },
    {
      id: 'space',
      label: 'Space 🚀',
      icon: <Rocket className="w-4 h-4 text-purple-500" />,
      color: 'hover:bg-purple-50 text-purple-950',
      desc: 'Lasers & portals'
    },
  ];

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Trigger Button */}
      <button
        id="sound-toggle-btn"
        onClick={() => {
          sound.playTap();
          setIsOpen(!isOpen);
        }}
        className={`p-3 rounded-full transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
          muted
            ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
            : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
        }`}
        title="Sound & Synthesizer Settings"
      >
        {muted ? (
          <VolumeX className="w-5 h-5 shrink-0" />
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <Volume2 className="w-5 h-5 shrink-0" />
            {/* Equalizer Bars Container */}
            <div className="flex items-end gap-[2px] h-4 w-4 justify-center">
              <div ref={bar1Ref} className={`w-[2.5px] rounded-full transition-all duration-75 ${themeColorClass}`} style={{ height: '3px' }} />
              <div ref={bar2Ref} className={`w-[2.5px] rounded-full transition-all duration-75 ${themeColorClass}`} style={{ height: '3px' }} />
              <div ref={bar3Ref} className={`w-[2.5px] rounded-full transition-all duration-75 ${themeColorClass}`} style={{ height: '3px' }} />
              <div ref={bar4Ref} className={`w-[2.5px] rounded-full transition-all duration-75 ${themeColorClass}`} style={{ height: '3px' }} />
            </div>
          </div>
        )}
        <Settings className="w-3 h-3 text-slate-500 opacity-60 ml-0.5 animate-spin-slow" />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl border-2 border-amber-100 shadow-xl p-3 space-y-3.5 z-50 text-left"
          >
            {/* Header / Mute Control */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-50">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Sound System
              </span>
              <button
                id="btn-popover-mute"
                onClick={handleMuteToggle}
                className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                  muted
                    ? 'bg-rose-100 text-rose-600 border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {muted ? 'MUTED 🔕' : 'SOUND ON 🔊'}
              </button>
            </div>

            {/* Synthesizer Themes Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                Synth Theme
              </span>

              <div className="space-y-1">
                {themes.map((t) => {
                  const isCurrent = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      id={`synth-theme-${t.id}`}
                      onClick={(e) => handleThemeSelect(t.id, e)}
                      disabled={muted}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        muted ? 'opacity-40 cursor-not-allowed' : ''
                      } ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100 font-extrabold'
                          : 'border-transparent bg-white hover:border-slate-100'
                      } ${t.color}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-slate-100 rounded-lg">
                          {t.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 leading-none">
                            {t.label}
                          </div>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {t.desc}
                          </span>
                        </div>
                      </div>
                      
                      {isCurrent && (
                        <Check className="w-4 h-4 text-amber-600 font-extrabold shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-1.5 border-t border-amber-50 pt-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                Game Difficulty
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((dId) => {
                  const isCurrent = difficulty === dId;
                  const icon = dId === 'easy' ? '🌱' : dId === 'medium' ? '🦁' : '🐉';
                  const bgActive = 
                    dId === 'easy' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100 font-extrabold text-emerald-700' :
                    dId === 'medium' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100 font-extrabold text-amber-700' :
                    'bg-rose-50 border-rose-300 ring-2 ring-rose-100 font-extrabold text-rose-700';
                  return (
                    <button
                      key={dId}
                      id={`diff-btn-${dId}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playTap();
                        if (onDifficultyChange) {
                          onDifficultyChange(dId);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? bgActive
                          : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg mb-0.5">{icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-tight text-slate-700">
                        {dId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[9px] font-bold text-center text-amber-900/40 bg-amber-50/30 py-1.5 rounded-lg border border-amber-100/30">
              Pick a theme, then pop some balloons!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
