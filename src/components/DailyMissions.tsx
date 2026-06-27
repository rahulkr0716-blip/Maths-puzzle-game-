/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyMission } from '../types';
import { sound } from '../utils/sound';
import { Gift, CheckCircle, RefreshCw, Star, Sparkles } from 'lucide-react';

interface DailyMissionsProps {
  missions: DailyMission[];
  onClaim: (id: string) => void;
  onRotate: () => void;
}

export default function DailyMissions({ missions, onClaim, onRotate }: DailyMissionsProps) {
  const handleClaim = (id: string) => {
    sound.playStar();
    sound.vibrate(50);
    onClaim(id);
  };

  const handleRotate = () => {
    sound.playTap();
    sound.vibrate(30);
    onRotate();
  };

  return (
    <div id="daily-missions-section" className="bg-white/95 rounded-2xl p-4 border-2 border-amber-100/60 shadow-sm space-y-3.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">📅</span>
          <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider">
            Daily Missions
          </h3>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-200">
            EXTRA STARS!
          </span>
        </div>

        <button
          id="btn-rotate-missions"
          onClick={handleRotate}
          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-extrabold cursor-pointer border border-amber-100 bg-amber-50/20"
          title="Shuffle new missions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {missions.map((mission) => {
            const progressPercent = Math.min(100, (mission.current / mission.target) * 100);
            const isCompleted = mission.current >= mission.target;
            const isClaimed = mission.claimed;

            return (
              <motion.div
                key={mission.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isClaimed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-100'
                    : 'bg-white border-amber-100/60'
                }`}
              >
                {/* Left side: Mission info & progress bar */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm shrink-0">
                      {isClaimed ? '✅' : isCompleted ? '🎁' : '🎯'}
                    </span>
                    <span className={`text-xs font-bold leading-tight ${isClaimed ? 'text-slate-400 line-through' : 'text-amber-950'}`}>
                      {mission.description}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {!isClaimed && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-black text-amber-900/60">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/40">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="ml-2 shrink-0">
                          {mission.current}/{mission.target}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Action Button / Status */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      Claimed ⭐
                    </span>
                  ) : isCompleted ? (
                    <motion.button
                      id={`claim-mission-${mission.id}`}
                      onClick={() => handleClaim(mission.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-black text-[11px] px-3 py-1.5 rounded-lg border-b-2 border-amber-700 shadow-md cursor-pointer flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>CLAIM +{mission.rewardStars}</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>+{mission.rewardStars}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
