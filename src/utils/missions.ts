/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyMission } from '../types';

const MISSION_POOL: Omit<DailyMission, 'current' | 'completed' | 'claimed'>[] = [
  {
    id: 'solve_5_any',
    description: 'Solve 5 maths puzzles 🧩',
    target: 5,
    rewardStars: 3,
    type: 'solve_any'
  },
  {
    id: 'solve_2_multiply',
    description: 'Solve 2 multiplication puzzles ✖️',
    target: 2,
    rewardStars: 4,
    type: 'solve_multiply'
  },
  {
    id: 'reach_3_streak',
    description: 'Get a streak of 3 answers 🔥',
    target: 3,
    rewardStars: 5,
    type: 'reach_streak'
  },
  {
    id: 'solve_3_balloons',
    description: 'Pop 3 target balloons 🎈',
    target: 3,
    rewardStars: 3,
    type: 'solve_balloons'
  },
  {
    id: 'solve_3_sequences',
    description: 'Crack 3 sequence codes 🔍',
    target: 3,
    rewardStars: 3,
    type: 'solve_sequences'
  },
  {
    id: 'solve_3_balance',
    description: 'Balance 3 weight scales ⚖️',
    target: 3,
    rewardStars: 3,
    type: 'solve_balance'
  },
  {
    id: 'solve_3_grid',
    description: 'Solve 3 fruit equations 🍏',
    target: 3,
    rewardStars: 3,
    type: 'solve_grid'
  }
];

export function generateDailyMissions(): DailyMission[] {
  // Shuffle pool and take 3
  const shuffled = [...MISSION_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((m) => ({
    ...m,
    current: 0,
    completed: false,
    claimed: false,
  }));
}
