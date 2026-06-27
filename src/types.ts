/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'balloons' | 'sequences' | 'balance' | 'grid' | 'quick_match';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Avatar {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
}

export interface Puzzle {
  id: string;
  mode: GameMode;
  questionText: string;
  // For specialized displays
  gridData?: {
    items: { emoji: string; value: number }[];
    equations: { formula: string; result: number }[];
    targetEmoji: string;
  };
  balanceData?: {
    leftVal: number | string;
    rightVal: number | string;
    leftDisplay: string;
    rightDisplay: string;
  };
  sequenceData?: {
    numbers: (number | string)[];
    missingIndex: number;
  };
  balloonData?: {
    num1: number;
    num2: number;
    operator: '+' | '-' | '×';
  };
  options: string[];
  correctAnswer: string;
}

export interface UserStats {
  playerName: string;
  avatar: Avatar | null;
  stars: number;
  level: number; // 1 to 10
  streak: number;
  bestStreak: number;
  loginStreak: number;
  lastLoginDate?: string;
  difficulty?: Difficulty;
}

export interface DailyMission {
  id: string;
  description: string;
  target: number;
  current: number;
  rewardStars: number;
  completed: boolean;
  claimed: boolean;
  type: 'solve_any' | 'solve_multiply' | 'reach_streak' | 'solve_balloons' | 'solve_sequences' | 'solve_balance' | 'solve_grid';
}

export type SoundTheme = 'classic' | 'jungle' | 'space';

