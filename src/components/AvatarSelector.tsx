/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Avatar } from '../types';
import { sound } from '../utils/sound';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { AVATAR_LIST } from '../utils/avatars';

const AVAILABLE_AVATARS = AVATAR_LIST.filter(a => a.unlockType === 'free');

interface AvatarSelectorProps {
  onSelect: (name: string, avatar: Avatar) => void;
}

export default function AvatarSelector({ onSelect }: AvatarSelectorProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState('');

  const handleSelectAvatar = (avatar: Avatar) => {
    sound.playTap();
    sound.vibrate(15);
    setSelectedAvatar(avatar);
    setError('');
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setError('Please type your name first! 😊');
      return;
    }
    if (cleanName.length > 12) {
      setError('Name is too long! Keep it under 12 characters 🌟');
      return;
    }
    if (!selectedAvatar) {
      setError('Please pick an animal buddy! 🦁');
      return;
    }

    sound.playSuccess();
    onSelect(cleanName, selectedAvatar);
  };

  return (
    <div id="avatar-selector-screen" className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="mb-8"
      >
        <div className="flex justify-center mb-3">
          <div className="bg-yellow-100 p-4 rounded-full border-4 border-yellow-300 shadow-inner">
            <Gamepad2 className="w-12 h-12 text-yellow-600 animate-bounce" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-amber-900 tracking-tight flex items-center justify-center gap-2">
          Maths Safari <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-400" />
        </h1>
        <p className="text-sm font-semibold text-amber-700 mt-1">
          Learn numbers, solve puzzles, win stars! 🌟
        </p>
      </motion.div>

      <form onSubmit={handleStartGame} className="w-full space-y-6">
        <div className="text-left">
          <label htmlFor="player-name-input" className="block text-sm font-bold text-amber-900 mb-2 ml-1">
            What's your name, Adventurer?
          </label>
          <input
            id="player-name-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Type your name here..."
            className="w-full px-5 py-4 rounded-2xl border-4 border-amber-200 focus:border-amber-400 bg-white text-lg font-bold text-amber-900 outline-none placeholder-amber-300 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-left text-sm font-bold text-amber-900 mb-3 ml-1">
            Choose your Math Buddy!
          </label>
          <div className="grid grid-cols-3 gap-3">
            {AVAILABLE_AVATARS.map((avatar) => {
              const isSelected = selectedAvatar?.id === avatar.id;
              return (
                <motion.button
                  key={avatar.id}
                  id={`avatar-${avatar.id}`}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectAvatar(avatar)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-50 shadow-md ring-4 ring-yellow-200/50'
                      : 'border-transparent bg-white hover:border-amber-100 shadow-sm'
                  }`}
                >
                  <span className={`text-4xl mb-1 ${isSelected ? 'animate-pulse' : ''}`}>
                    {avatar.emoji}
                  </span>
                  <span className="text-2s font-extrabold text-amber-900 line-clamp-1">
                    {avatar.id.toUpperCase()}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-rose-600 bg-rose-50 py-2.5 px-4 rounded-xl border-2 border-rose-200"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          id="btn-let-play"
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-lg py-4 px-6 rounded-2xl border-b-8 border-amber-700 hover:brightness-105 transition-all shadow-lg active:border-b-2 active:mt-1.5 flex items-center justify-center gap-2 cursor-pointer"
        >
          Let's Play! 🚀
        </motion.button>
      </form>
    </div>
  );
}
