/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, Award, Star, Flame, Trophy, Check } from 'lucide-react';
import { sound } from '../utils/sound';
import { AVATAR_LIST, isAvatarUnlocked, UnlockableAvatar } from '../utils/avatars';
import { UserStats, Avatar } from '../types';

interface AvatarGalleryProps {
  stats: UserStats;
  onSelectAvatar: (avatar: Avatar) => void;
  onClose: () => void;
}

export default function AvatarGallery({ stats, onSelectAvatar, onClose }: AvatarGalleryProps) {
  const [selectedPreview, setSelectedPreview] = useState<UnlockableAvatar | null>(
    AVATAR_LIST.find((a) => a.id === stats.avatar?.id) || AVATAR_LIST[0]
  );

  const handleBuddyClick = (buddy: UnlockableAvatar) => {
    sound.playTap();
    setSelectedPreview(buddy);

    const unlocked = isAvatarUnlocked(buddy, {
      level: stats.level,
      stars: stats.stars,
      bestStreak: stats.bestStreak,
    });

    if (unlocked) {
      onSelectAvatar({
        id: buddy.id,
        emoji: buddy.emoji,
        label: buddy.label,
        color: buddy.color,
        bgColor: buddy.bgColor,
      });
    }
  };

  return (
    <div
      id="avatar-gallery-modal"
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 text-slate-800"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 18 }}
        className="bg-amber-50/95 border-6 border-amber-400 rounded-[32px] p-5 shadow-2xl max-w-md w-full max-h-[92%] flex flex-col relative overflow-hidden"
      >
        {/* Playful background sun rays */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold flex items-center justify-center cursor-pointer transition-all border-2 border-amber-300 shadow-sm z-10 hover:scale-105"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center pb-2 border-b border-amber-200/70 relative">
          <div className="flex justify-center mb-1">
            <span className="text-3xl animate-pulse">🐾</span>
          </div>
          <h2 className="text-2xl font-black text-amber-950 uppercase tracking-tight flex items-center justify-center gap-1.5">
            Buddy Gallery <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          </h2>
          <p className="text-[11px] font-bold text-amber-800 max-w-xs mx-auto mt-0.5">
            Level up, collect stars, and build answer streaks to unlock rare animal buddies!
          </p>
        </div>

        {/* Player Milestones Bar */}
        <div className="grid grid-cols-3 gap-1.5 bg-amber-100/60 p-2.5 rounded-2xl border border-amber-200/80 my-3 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xs">🏆</span>
            <span className="text-[9px] font-bold uppercase text-amber-800">Level</span>
            <span className="text-xs font-black text-amber-950">{stats.level}</span>
          </div>
          <div className="flex flex-col items-center border-x border-amber-200">
            <span className="text-xs">⭐</span>
            <span className="text-[9px] font-bold uppercase text-amber-800">Stars</span>
            <span className="text-xs font-black text-amber-950">{stats.stars}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">🔥</span>
            <span className="text-[9px] font-bold uppercase text-amber-800">Best Streak</span>
            <span className="text-xs font-black text-amber-950">{stats.bestStreak}</span>
          </div>
        </div>

        {/* Scrollable Avatars Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-4 max-h-[300px] min-h-[180px]">
          <div className="grid grid-cols-3 gap-2.5">
            {AVATAR_LIST.map((buddy) => {
              const unlocked = isAvatarUnlocked(buddy, {
                level: stats.level,
                stars: stats.stars,
                bestStreak: stats.bestStreak,
              });
              const isCurrent = stats.avatar?.id === buddy.id;
              const isSelectedPreview = selectedPreview?.id === buddy.id;

              return (
                <motion.button
                  key={buddy.id}
                  id={`gallery-buddy-${buddy.id}`}
                  whileHover={{ scale: unlocked ? 1.04 : 1.01 }}
                  whileTap={{ scale: unlocked ? 0.96 : 0.99 }}
                  onClick={() => handleBuddyClick(buddy)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-3 transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-amber-50 ring-3 ring-yellow-200/50 shadow-md'
                      : isSelectedPreview
                      ? 'border-amber-300 bg-amber-100/40 shadow-sm'
                      : unlocked
                      ? 'border-transparent bg-white hover:border-amber-200/80 shadow-sm'
                      : 'border-slate-200 bg-slate-100/50 opacity-75'
                  }`}
                >
                  {/* Status Badges */}
                  {isCurrent && (
                    <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white rounded-full p-0.5 border-2 border-white shadow">
                      <Check className="w-2.5 h-2.5 stroke-[4]" />
                    </span>
                  )}
                  {!unlocked && (
                    <span className="absolute top-1.5 right-1.5 bg-slate-300 text-slate-600 rounded-full p-1 border border-white shadow-sm">
                      <Lock className="w-2 h-2" />
                    </span>
                  )}

                  {/* Character Emoji */}
                  <span
                    className={`text-4.5xl mb-1 transition-transform ${
                      unlocked ? '' : 'filter grayscale contrast-75 brightness-95'
                    } ${isCurrent ? 'scale-110' : ''}`}
                  >
                    {buddy.emoji}
                  </span>

                  {/* Name Label */}
                  <span className="text-[10px] font-black uppercase text-amber-950 tracking-tight leading-none text-center">
                    {buddy.id}
                  </span>

                  {/* Unlock Condition text under the icon */}
                  {!unlocked && (
                    <span className="text-[8px] font-extrabold text-slate-500 mt-1 uppercase bg-slate-200 px-1 py-0.5 rounded">
                      {buddy.unlockType === 'level' && `Lv ${buddy.unlockValue}`}
                      {buddy.unlockType === 'stars' && `⭐${buddy.unlockValue}`}
                      {buddy.unlockType === 'streak' && `🔥${buddy.unlockValue}`}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Buddy Detail Panel */}
        {selectedPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-white p-3.5 rounded-2xl border-2 border-amber-200/70 shadow-sm space-y-1.5 relative"
          >
            {/* Check if previewed is unlocked */}
            {(() => {
              const unlocked = isAvatarUnlocked(selectedPreview, {
                level: stats.level,
                stars: stats.stars,
                bestStreak: stats.bestStreak,
              });
              const isCurrent = stats.avatar?.id === selectedPreview.id;

              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedPreview.emoji}</span>
                    <div className="text-left leading-tight">
                      <h4 className="font-extrabold text-amber-950 text-sm">
                        {selectedPreview.label}
                      </h4>
                      <p className="text-[10px] font-bold text-amber-600">
                        {unlocked ? (
                          <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                            ✅ Unlocked & Active buddy
                          </span>
                        ) : (
                          <span className="text-slate-500 font-extrabold flex items-center gap-0.5">
                            🔒 Locked Companion
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                    {selectedPreview.description}
                  </p>

                  {/* Unlock instructions / Switch Button */}
                  {unlocked ? (
                    isCurrent ? (
                      <div className="text-center text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 py-1.5 rounded-xl uppercase tracking-wider">
                        🐾 Currently active helper!
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuddyClick(selectedPreview)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 rounded-xl shadow border-b-3 border-emerald-800 transition-all cursor-pointer hover:scale-[1.01]"
                      >
                        SET AS MY BUDDY! 🚀
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/60 p-2 rounded-xl text-xs font-bold text-rose-800">
                      <span className="text-sm">💡</span>
                      <span>
                        Need{' '}
                        <strong className="font-extrabold text-rose-950">
                          {selectedPreview.unlockType === 'level' && `Level ${selectedPreview.unlockValue}`}
                          {selectedPreview.unlockType === 'stars' && `${selectedPreview.unlockValue} Total Stars`}
                          {selectedPreview.unlockType === 'streak' && `${selectedPreview.unlockValue}-Answer Streak`}
                        </strong>{' '}
                        to unlock this buddy!
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
