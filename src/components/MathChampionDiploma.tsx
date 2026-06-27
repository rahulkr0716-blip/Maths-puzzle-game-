/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { UserStats } from '../types';
import { sound } from '../utils/sound';
import { Award, Star, RefreshCw, Calendar, CheckCircle, Sparkles } from 'lucide-react';

interface MathChampionDiplomaProps {
  stats: UserStats;
  onRestart: () => void;
}

export default function MathChampionDiploma({ stats, onRestart }: MathChampionDiplomaProps) {
  // Play triumphant level-up or champion tune when loaded
  useEffect(() => {
    sound.playLevelUp();
    const interval = setInterval(() => {
      sound.playStar();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div id="diploma-screen" className="w-full max-w-lg mx-auto p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-amber-50 border-8 border-yellow-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Background confetti design */}
        <div className="absolute top-4 left-4 text-3xl animate-bounce">🎈</div>
        <div className="absolute top-4 right-4 text-3xl animate-bounce delay-300">🎉</div>
        <div className="absolute bottom-4 left-6 text-3xl animate-bounce delay-150">🎨</div>
        <div className="absolute bottom-4 right-6 text-3xl animate-bounce delay-500">✨</div>

        <div className="relative z-10 space-y-5">
          {/* Top badge */}
          <div className="flex justify-center">
            <div className="bg-yellow-400 p-4 rounded-full border-4 border-white shadow-lg animate-spin-slow">
              <Award className="w-12 h-12 text-amber-900" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-amber-950 uppercase tracking-wider">
            Math Safari Champion
          </h1>
          
          {/* Certificate Inner Card */}
          <div className="bg-white border-4 border-dashed border-yellow-300 rounded-2xl p-6 shadow-inner space-y-4">
            <span className="text-amber-600 font-black text-xs uppercase tracking-widest block">
              Official Diploma of Achievement
            </span>

            <p className="text-sm font-semibold text-slate-500 italic">
              This certificate is proudly awarded to
            </p>

            <div className="py-2">
              <span className="text-3xl font-black text-amber-900 border-b-4 border-amber-500 px-6 pb-1 inline-block">
                {stats.playerName}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-3xl my-2">
              <span>{stats.avatar?.emoji}</span>
              <span className="text-sm font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {stats.avatar?.label}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
              for successfully completing all <strong className="text-yellow-600">Level 10 Math Challenges</strong> of the Maths Safari Adventure, collecting a total of:
            </p>

            <div className="flex justify-center items-center gap-1 text-yellow-500 bg-yellow-50/50 py-3 rounded-2xl max-w-xs mx-auto border border-yellow-100">
              <Star className="w-6 h-6 fill-yellow-400" />
              <span className="text-2xl font-black text-amber-900">{stats.stars}</span>
              <span className="text-md font-extrabold text-amber-800">Golden Stars! 🌟</span>
            </div>
          </div>

          {/* Signatures & Date */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-700/60 uppercase block">Date Earned</span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-950">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {todayStr}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] font-black text-amber-700/60 uppercase block">Safari Director</span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-950">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified Buddy ✅
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <motion.button
            id="diploma-restart-btn"
            onClick={onRestart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-lg py-4 px-6 rounded-2xl border-b-8 border-emerald-700 hover:brightness-105 transition-all shadow-lg active:border-b-2 active:mt-1.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 animate-spin" /> Play Safari Again!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
