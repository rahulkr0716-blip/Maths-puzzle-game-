/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Avatar } from '../types';

export interface UnlockableAvatar extends Avatar {
  unlockType: 'free' | 'level' | 'stars' | 'streak';
  unlockValue: number;
  description: string;
}

export const AVATAR_LIST: UnlockableAvatar[] = [
  {
    id: 'lion',
    emoji: '🦁',
    label: 'Leo the Lion',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 border-amber-300',
    unlockType: 'free',
    unlockValue: 0,
    description: 'Always ready to roar for math! Unlocked by default.',
  },
  {
    id: 'panda',
    emoji: '🐼',
    label: 'Pip the Panda',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300',
    unlockType: 'free',
    unlockValue: 0,
    description: 'Loves munching bamboo and adding numbers. Unlocked by default.',
  },
  {
    id: 'fox',
    emoji: '🦊',
    label: 'Felix the Fox',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 border-orange-300',
    unlockType: 'free',
    unlockValue: 0,
    description: 'Super clever and loves tricky sequences. Unlocked by default.',
  },
  {
    id: 'frog',
    emoji: '🐸',
    label: 'Fiona the Frog',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 border-emerald-300',
    unlockType: 'free',
    unlockValue: 0,
    description: 'Hops onto balloons to solve equations. Unlocked by default.',
  },
  {
    id: 'koala',
    emoji: '🐨',
    label: 'Kiki the Koala',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 border-indigo-300',
    unlockType: 'level',
    unlockValue: 2,
    description: 'Unlocks at Level 2. Loves sleepy subtraction and cozy trees.',
  },
  {
    id: 'monkey',
    emoji: '🐒',
    label: 'Milo the Monkey',
    color: 'text-amber-800',
    bgColor: 'bg-amber-100 border-amber-300',
    unlockType: 'level',
    unlockValue: 4,
    description: 'Unlocks at Level 4. Loves swinging from branch to branch doing arithmetic!',
  },
  {
    id: 'tiger',
    emoji: '🐯',
    label: 'Toby the Tiger',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-200',
    unlockType: 'level',
    unlockValue: 6,
    description: 'Unlocks at Level 6. Fast, brave, and extremely sharp with division!',
  },
  {
    id: 'penguin',
    emoji: '🐧',
    label: 'Penny the Penguin',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 border-cyan-300',
    unlockType: 'level',
    unlockValue: 8,
    description: 'Unlocks at Level 8. A cool head is best for freezing cold math puzzles.',
  },
  {
    id: 'dino',
    emoji: '🦖',
    label: 'Rex the Dino',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    unlockType: 'level',
    unlockValue: 10,
    description: 'Unlocks at Level 10. Ancient, legendary math master of the volcano!',
  },
  {
    id: 'unicorn',
    emoji: '🦄',
    label: 'Una the Unicorn',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 border-pink-300',
    unlockType: 'stars',
    unlockValue: 15,
    description: 'Unlocks with 15 Stars. Magic sparkles can balance any scale.',
  },
  {
    id: 'owl',
    emoji: '🦉',
    label: 'Ozzy the Owl',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 border-purple-300',
    unlockType: 'stars',
    unlockValue: 25,
    description: 'Unlocks with 25 Stars. Wise observer of grid equations and patterns.',
  },
  {
    id: 'dragon',
    emoji: '🐉',
    label: 'Rocky the Dragon',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 border-rose-300',
    unlockType: 'stars',
    unlockValue: 45,
    description: 'Unlocks with 45 Stars. Breath of fire sparks algebraic mastery!',
  },
  {
    id: 'dog',
    emoji: '🐶',
    label: 'Dexter the Dog',
    color: 'text-sky-600',
    bgColor: 'bg-sky-100 border-sky-300',
    unlockType: 'streak',
    unlockValue: 3,
    description: 'Unlocks with a 3-Answer Streak. Loyal friend who loves quick fetch matches.',
  },
  {
    id: 'giraffe',
    emoji: '🦒',
    label: 'Gary the Giraffe',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    unlockType: 'streak',
    unlockValue: 5,
    description: 'Unlocks with a 5-Answer Streak. Reaches high up to check all calculations.',
  },
  {
    id: 'rabbit',
    emoji: '🚀🐰',
    label: 'Cosmo Spacebunny',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 border-indigo-200',
    unlockType: 'streak',
    unlockValue: 8,
    description: 'Unlocks with an 8-Answer Streak. Math is out of this world!',
  },
];

/**
 * Checks if a given avatar is unlocked based on current user stats.
 */
export function isAvatarUnlocked(avatar: UnlockableAvatar, stats: { level: number; stars: number; bestStreak: number }): boolean {
  if (avatar.unlockType === 'free') return true;
  if (avatar.unlockType === 'level') return stats.level >= avatar.unlockValue;
  if (avatar.unlockType === 'stars') return stats.stars >= avatar.unlockValue;
  if (avatar.unlockType === 'streak') return stats.bestStreak >= avatar.unlockValue;
  return false;
}
