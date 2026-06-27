/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, Puzzle, UserStats, GameMode, DailyMission } from './types';
import { generatePuzzle } from './utils/puzzleGenerator';
import { sound } from './utils/sound';
import { generateDailyMissions } from './utils/missions';
import AvatarSelector from './components/AvatarSelector';
import AvatarGallery from './components/AvatarGallery';
import GameCard from './components/GameCard';
import MathChampionDiploma from './components/MathChampionDiploma';
import SoundToggle from './components/SoundToggle';
import DailyMissions from './components/DailyMissions';
import LevelProgressChart from './components/LevelProgressChart';
import { Star, Flame, Trophy, Award, Gamepad2, Sparkles, HelpCircle } from 'lucide-react';

const MODE_META: { id: GameMode; label: string; icon: string; color: string }[] = [
  { id: 'balloons', label: 'Pop Sums', icon: '🎈', color: 'from-red-400 to-rose-400' },
  { id: 'sequences', label: 'Patterns', icon: '🔍', color: 'from-indigo-400 to-blue-400' },
  { id: 'balance', label: 'Scales', icon: '⚖️', color: 'from-emerald-400 to-teal-400' },
  { id: 'grid', label: 'Fruits', icon: '🍏', color: 'from-yellow-400 to-amber-400' },
];

const LEVEL_NAMES = [
  'Forest Counting',
  'River Addition',
  'Meadow Subtraction',
  'Mountain Sequences',
  'Valley Scales',
  'Desert Fruit Mystery',
  'Canyon Tables',
  'Jungle Arithmetic',
  'Sky High Puzzles',
  'Safari Math Champion! 🏆',
];

const DAILY_REWARDS = [5, 10, 15, 20, 25, 30, 50]; // Day 1 to Day 7 rewards

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysBetween = (dateStr1: string, dateStr2: string) => {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('safari_math_user_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.playerName) {
          return {
            playerName: parsed.playerName || '',
            avatar: parsed.avatar || null,
            stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
            level: typeof parsed.level === 'number' ? parsed.level : 1,
            streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
            bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
            loginStreak: typeof parsed.loginStreak === 'number' ? parsed.loginStreak : 1,
            lastLoginDate: parsed.lastLoginDate || '',
            difficulty: parsed.difficulty || 'medium',
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      playerName: '',
      avatar: null,
      stars: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      loginStreak: 1,
      lastLoginDate: '',
      difficulty: 'medium',
    };
  });

  const [activeMode, setActiveMode] = useState<GameMode>('balloons');
  const [starsForCurrentLevel, setStarsForCurrentLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('safari_stars_for_current_level');
      if (saved !== null) {
        return parseInt(saved, 10);
      }
    } catch (e) {
      console.error(e);
    }
    return 0;
  });
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState<boolean>(false);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [systemTimeStr, setSystemTimeStr] = useState<string>('12:00');
  const [missions, setMissions] = useState<DailyMission[]>(() => {
    return generateDailyMissions();
  });
  const [starHistory, setStarHistory] = useState<{ level: string; stars: number }[]>(() => {
    try {
      const saved = localStorage.getItem('safari_star_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Daily Login Bonus states
  const [showDailyBonusModal, setShowDailyBonusModal] = useState<boolean>(false);
  const [dailyBonusClaimedToday, setDailyBonusClaimedToday] = useState<boolean>(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState<boolean>(false);

  // Quick Match challenge states
  const [quickMatchState, setQuickMatchState] = useState<'idle' | 'playing' | 'summary'>('idle');
  const [quickMatchTimeLeft, setQuickMatchTimeLeft] = useState<number>(60);
  const [quickMatchScore, setQuickMatchScore] = useState<number>(0);
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);

  // Phone clock mock updates
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setSystemTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate puzzle whenever activeMode, stats.level, stats.difficulty, or puzzleIndex changes
  useEffect(() => {
    if (stats.avatar) {
      const puz = generatePuzzle(activeMode, stats.level, stats.difficulty || 'medium');
      setActivePuzzle(puz);
    }
  }, [activeMode, stats.level, stats.difficulty, stats.avatar, puzzleIndex]);

  // Quick Match timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeMode === 'quick_match' && quickMatchState === 'playing') {
      interval = setInterval(() => {
        setQuickMatchTimeLeft((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            sound.playLevelUp();
            setQuickMatchState('summary');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMode, quickMatchState]);

  // Daily Login Bonus Checker logic
  const checkDailyLogin = (currentStats: UserStats) => {
    if (!currentStats.playerName) return;

    const todayStr = getTodayString();
    const lastLogin = currentStats.lastLoginDate;
    const lastClaimed = localStorage.getItem('safari_math_last_claimed_date');

    const isClaimed = lastClaimed === todayStr;
    setDailyBonusClaimedToday(isClaimed);

    if (!lastLogin) {
      // First login ever
      const updated = {
        ...currentStats,
        loginStreak: 1,
        lastLoginDate: todayStr,
      };
      setStats(updated);
      localStorage.setItem('safari_math_user_stats', JSON.stringify(updated));
      setDailyBonusClaimedToday(false);
      setShowDailyBonusModal(true);
    } else {
      const daysDiff = getDaysBetween(lastLogin, todayStr);
      if (daysDiff === 1) {
        // Consecutive days!
        const updated = {
          ...currentStats,
          loginStreak: currentStats.loginStreak + 1,
          lastLoginDate: todayStr,
        };
        setStats(updated);
        localStorage.setItem('safari_math_user_stats', JSON.stringify(updated));
        setDailyBonusClaimedToday(false);
        setShowDailyBonusModal(true);
      } else if (daysDiff > 1) {
        // Streak broken
        const updated = {
          ...currentStats,
          loginStreak: 1,
          lastLoginDate: todayStr,
        };
        setStats(updated);
        localStorage.setItem('safari_math_user_stats', JSON.stringify(updated));
        setDailyBonusClaimedToday(false);
        setShowDailyBonusModal(true);
      } else if (daysDiff === 0) {
        if (!isClaimed) {
          setShowDailyBonusModal(true);
        }
      }
    }
  };

  // Run once on mount if name is loaded
  useEffect(() => {
    if (stats.playerName) {
      checkDailyLogin(stats);
    }
  }, []);

  // Save other state values on change
  useEffect(() => {
    localStorage.setItem('safari_stars_for_current_level', String(starsForCurrentLevel));
  }, [starsForCurrentLevel]);

  useEffect(() => {
    localStorage.setItem('safari_star_history', JSON.stringify(starHistory));
  }, [starHistory]);

  useEffect(() => {
    if (stats.playerName) {
      localStorage.setItem('safari_math_user_stats', JSON.stringify(stats));
    }
  }, [stats]);

  const handleAvatarSelect = (name: string, avatar: Avatar) => {
    const todayStr = getTodayString();
    const initialStats: UserStats = {
      playerName: name,
      avatar,
      stars: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      loginStreak: 1,
      lastLoginDate: todayStr,
      difficulty: 'medium',
    };
    setStats(initialStats);
    localStorage.setItem('safari_math_user_stats', JSON.stringify(initialStats));
    setStarsForCurrentLevel(0);
    setActiveMode('balloons');
    setStarHistory([{ level: 'Lvl 1', stars: 0 }]);
    
    // Check or trigger bonus
    const lastClaimed = localStorage.getItem('safari_math_last_claimed_date');
    if (lastClaimed === todayStr) {
      setDailyBonusClaimedToday(true);
    } else {
      setDailyBonusClaimedToday(false);
      setShowDailyBonusModal(true);
    }
  };

  const handleAnswerResult = (isCorrect: boolean, selectedOption: string) => {
    if (activeMode === 'quick_match') {
      if (isCorrect) {
        setQuickMatchScore((prev) => prev + 1);
      }
      setPuzzleIndex((prev) => prev + 1);
      return;
    }

    const isMultiplication = activePuzzle?.balloonData?.operator === '×';
    const nextStreak = isCorrect ? stats.streak + 1 : 0;

    // Update daily missions progress
    setMissions((prevMissions) => {
      return prevMissions.map((mission) => {
        if (mission.claimed) return mission;

        let nextCurrent = mission.current;

        if (isCorrect) {
          if (mission.type === 'solve_any') {
            nextCurrent += 1;
          } else if (mission.type === 'solve_balloons' && activeMode === 'balloons') {
            nextCurrent += 1;
          } else if (mission.type === 'solve_sequences' && activeMode === 'sequences') {
            nextCurrent += 1;
          } else if (mission.type === 'solve_balance' && activeMode === 'balance') {
            nextCurrent += 1;
          } else if (mission.type === 'solve_grid' && activeMode === 'grid') {
            nextCurrent += 1;
          } else if (mission.type === 'solve_multiply' && isMultiplication) {
            nextCurrent += 1;
          }
        }

        if (mission.type === 'reach_streak') {
          nextCurrent = Math.max(nextCurrent, nextStreak);
        }

        const isCompleted = nextCurrent >= mission.target;

        return {
          ...mission,
          current: Math.min(nextCurrent, mission.target),
          completed: isCompleted,
        };
      });
    });

    if (isCorrect) {
      // Correct! Increment stats
      const nextStreakValue = stats.streak + 1;
      const nextBest = Math.max(stats.bestStreak, nextStreakValue);
      const nextStarsForLevel = starsForCurrentLevel + 1;

      setStats((prev) => ({
        ...prev,
        stars: prev.stars + 1,
        streak: nextStreakValue,
        bestStreak: nextBest,
      }));

      if (nextStarsForLevel >= 3) {
        // Level up!
        sound.playLevelUp();

        const completedLevelNum = stats.level;
        const totalStarsAtCompletion = stats.stars + 1;
        setStarHistory((prev) => {
          const filtered = prev.filter((item) => item.level !== `Lvl ${completedLevelNum}`);
          const nextHistory = [...filtered, { level: `Lvl ${completedLevelNum}`, stars: totalStarsAtCompletion }];
          const nextLevelNum = completedLevelNum + 1;
          if (nextLevelNum <= 10 && !nextHistory.some((item) => item.level === `Lvl ${nextLevelNum}`)) {
            nextHistory.push({ level: `Lvl ${nextLevelNum}`, stars: totalStarsAtCompletion });
          }
          return nextHistory;
        });

        if (stats.level >= 10) {
          // Finished game!
          setIsGameFinished(true);
        } else {
          setIsLevelingUp(true);
        }
      } else {
        setStarsForCurrentLevel(nextStarsForLevel);
        setPuzzleIndex((prev) => prev + 1);
      }
    } else {
      // Incorrect, reset streak
      setStats((prev) => ({
        ...prev,
        streak: 0,
      }));
      setPuzzleIndex((prev) => prev + 1);
    }
  };

  const proceedToNextLevel = () => {
    sound.playTap();
    setIsLevelingUp(false);
    setStarsForCurrentLevel(0);
    setStats((prev) => ({
      ...prev,
      level: prev.level + 1,
    }));
  };

  const handleRestartGame = () => {
    sound.playTap();
    setStats({
      playerName: '',
      avatar: null,
      stars: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      loginStreak: 1,
      lastLoginDate: '',
      difficulty: 'medium',
    });
    setStarsForCurrentLevel(0);
    setIsGameFinished(false);
    setIsLevelingUp(false);
    setMissions(generateDailyMissions());
    setStarHistory([]);
    setQuickMatchState('idle');
    setQuickMatchTimeLeft(60);
    setQuickMatchScore(0);
    setPuzzleIndex(0);

    // Clean local storage
    try {
      localStorage.removeItem('safari_math_user_stats');
      localStorage.removeItem('safari_stars_for_current_level');
      localStorage.removeItem('safari_star_history');
      localStorage.removeItem('safari_math_last_claimed_date');
    } catch (e) {
      console.error(e);
    }
    setDailyBonusClaimedToday(false);
    setShowDailyBonusModal(false);
  };

  const handleClaimMission = (missionId: string) => {
    setMissions((prevMissions) => {
      const found = prevMissions.find((m) => m.id === missionId);
      if (found && !found.claimed) {
        setStats((prevStats) => {
          const nextStars = prevStats.stars + found.rewardStars;
          setStarHistory((prevHistory) => {
            const filtered = prevHistory.filter((item) => item.level !== `Lvl ${prevStats.level}`);
            return [...filtered, { level: `Lvl ${prevStats.level}`, stars: nextStars }];
          });
          return {
            ...prevStats,
            stars: nextStars,
          };
        });
      }
      return prevMissions.map((m) =>
        m.id === missionId ? { ...m, claimed: true } : m
      );
    });
  };

  const handleRotateMissions = () => {
    setMissions(generateDailyMissions());
  };

  const handleUseHint = () => {
    setStats((prev) => {
      const nextStars = Math.max(0, prev.stars - 1);
      setStarHistory((prevHistory) => {
        const filtered = prevHistory.filter((item) => item.level !== `Lvl ${prev.level}`);
        return [...filtered, { level: `Lvl ${prev.level}`, stars: nextStars }];
      });
      return {
        ...prev,
        stars: nextStars,
      };
    });
  };

  const renderQuickMatch = () => {
    if (quickMatchState === 'idle') {
      return (
        <div id="quick-match-idle" className="bg-white rounded-3xl border-4 border-amber-100 p-6 shadow-md text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-[-20px] left-[-20px] text-5xl opacity-10 animate-pulse">⏱️</div>
          <div className="absolute bottom-[-20px] right-[-20px] text-5xl opacity-10 animate-pulse">⚡</div>

          <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto border-4 border-white shadow-md animate-bounce">
            <span className="text-4xl">⏱️</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-amber-950 uppercase tracking-tight">
              Math Quick Match!
            </h3>
            <p className="text-xs text-amber-900/85 max-w-[280px] mx-auto leading-relaxed">
              Answer as many math safari puzzles as possible in <strong>60 seconds</strong>! Each correct answer awards you <strong>1 bonus star ⭐</strong>!
            </p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 max-w-[260px] mx-auto text-left space-y-1.5 text-[11px] text-amber-950">
            <div className="flex gap-2">
              <span>🦖</span>
              <span>Puzzles adapt to your current <strong>Level {stats.level}</strong>!</span>
            </div>
            <div className="flex gap-2">
              <span>⚡</span>
              <span>Fast action: next puzzle loads instantly on answer!</span>
            </div>
            <div className="flex gap-2">
              <span>💡</span>
              <span>Hints remain active to help you when stuck!</span>
            </div>
          </div>

          <motion.button
            id="btn-start-quick-match"
            onClick={() => {
              sound.playTap();
              setQuickMatchScore(0);
              setQuickMatchTimeLeft(60);
              setQuickMatchState('playing');
              setPuzzleIndex((prev) => prev + 1); // trigger a new random puzzle
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold py-3.5 rounded-2xl border-b-4 border-amber-800 shadow-md transition-all active:border-b-0 cursor-pointer text-sm"
          >
            START 60s RUN! ⏱️🚀
          </motion.button>
        </div>
      );
    }

    if (quickMatchState === 'playing') {
      const isTimeLow = quickMatchTimeLeft <= 10;
      return (
        <div id="quick-match-playing" className="space-y-4">
          {/* Quick Match stats and timer bar */}
          <div className="bg-white/95 rounded-2xl p-4 border-2 border-amber-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">⚡</span>
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Math Blitz
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-200 text-xs flex items-center gap-1">
                  <span>✅</span>
                  <span>{quickMatchScore} Correct</span>
                </div>
                <div className={`font-black px-3 py-1 rounded-full text-xs shadow-sm border transition-all ${
                  isTimeLow 
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse' 
                    : 'bg-amber-950 border-amber-900 text-white'
                }`}>
                  ⏱️ {quickMatchTimeLeft}s
                </div>
              </div>
            </div>

            {/* Cute ticking countdown progress bar */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                className={`h-full transition-all duration-1000 ${
                  isTimeLow ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                }`}
                style={{ width: `${(quickMatchTimeLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Active puzzle inside quick match */}
          {activePuzzle ? (
            <GameCard
              puzzle={activePuzzle}
              onAnswer={handleAnswerResult}
              stars={stats.stars}
              onUseHint={handleUseHint}
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl border-4 border-amber-100 animate-pulse">
              <HelpCircle className="w-12 h-12 text-amber-300 mx-auto mb-2 animate-spin" />
              <span className="text-sm font-bold text-slate-500">Generating Quick Puzzle...</span>
            </div>
          )}
        </div>
      );
    }

    if (quickMatchState === 'summary') {
      return (
        <div id="quick-match-summary" className="bg-gradient-to-b from-yellow-300 to-amber-500 border-6 border-white rounded-3xl p-6 shadow-2xl space-y-4 text-center relative overflow-hidden" style={{ minHeight: '340px' }}>
          {/* Sparkles effect */}
          <div className="absolute top-2 left-2 text-2xl animate-spin-slow">✨</div>
          <div className="absolute bottom-2 right-2 text-2xl animate-spin-slow">✨</div>

          <div className="bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto border-4 border-yellow-400 shadow-md">
            <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-400 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-amber-950 uppercase tracking-tight leading-none">
              TIME'S UP! ⏱️🎉
            </h2>
            <p className="text-[11px] font-black text-amber-900 bg-white/80 py-1 px-3 rounded-full inline-block border border-amber-100 mt-1">
              Incredible blitz, {stats.playerName}!
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 border border-yellow-400 shadow-inner max-w-xs mx-auto space-y-2">
            <div className="flex justify-between items-center text-xs text-amber-950 font-black">
              <span>Puzzles Solved:</span>
              <span className="bg-amber-100 px-2 py-0.5 rounded-lg text-amber-900">{quickMatchScore} ✅</span>
            </div>
            <div className="flex justify-between items-center text-xs text-amber-950 font-black">
              <span>Bonus Reward:</span>
              <span className="bg-yellow-400 px-2.5 py-0.5 rounded-lg text-amber-950 border border-yellow-500">+{quickMatchScore} ⭐</span>
            </div>
          </div>

          <p className="text-xs font-bold text-amber-950 leading-relaxed max-w-[240px] mx-auto">
            You performed amazing calculations! Claim your stars below to boost your total star collection journey!
          </p>

          <motion.button
            id="btn-claim-quick-match-stars"
            onClick={() => {
              sound.playStar();
              setStats((prev) => {
                const nextStars = prev.stars + quickMatchScore;
                setStarHistory((prevHistory) => {
                  const filtered = prevHistory.filter((item) => item.level !== `Lvl ${prev.level}`);
                  return [...filtered, { level: `Lvl ${prev.level}`, stars: nextStars }];
                });
                return {
                  ...prev,
                  stars: nextStars,
                };
              });
              setQuickMatchState('idle');
              setQuickMatchScore(0);
              setQuickMatchTimeLeft(60);
              setActiveMode('balloons'); // return to the default mode elegantly
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-amber-950 hover:bg-amber-900 text-white font-extrabold py-3.5 rounded-xl border-b-4 border-amber-900 transition-all shadow-md active:border-b-0 cursor-pointer text-sm animate-pulse"
          >
            CLAIM {quickMatchScore} STARS! 🎁⭐
          </motion.button>
        </div>
      );
    }

    return null;
  };

  const levelProgressPercent = useMemo(() => {
    return (starsForCurrentLevel / 3) * 100;
  }, [starsForCurrentLevel]);

  return (
    <div id="safari-viewport-wrapper" className="min-h-screen bg-slate-100 py-4 px-2 flex items-center justify-center font-sans selection:bg-amber-200">
      
      {/* Native Styled Android Phone Frame */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-sky-200 via-amber-50 to-orange-100 rounded-[48px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden min-h-[820px] flex flex-col justify-between">
        
        {/* Mock Android Status Bar */}
        <div className="w-full bg-slate-900/90 text-slate-300 text-[10px] font-bold px-6 py-2.5 flex justify-between items-center z-50">
          <span>{systemTimeStr}</span>
          {/* Speaker / Notch */}
          <div className="w-16 h-3.5 bg-slate-900 absolute left-1/2 transform -translate-x-1/2 top-1 rounded-full border border-slate-800" />
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>📶</span>
            <span>🔋 100%</span>
          </div>
        </div>

        {/* Dynamic Content Container */}
        <div className="flex-1 flex flex-col justify-between p-5 relative overflow-y-auto max-h-[760px] pb-8">
          
          <AnimatePresence mode="wait">
            {/* 1. Avatar selector first */}
            {!stats.avatar ? (
              <motion.div
                key="avatar-select"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="my-auto"
              >
                <AvatarSelector onSelect={handleAvatarSelect} />
              </motion.div>
            ) : isGameFinished ? (
              /* 2. Celebrate Completion Diploma */
              <motion.div
                key="diploma"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="my-auto"
              >
                <MathChampionDiploma stats={stats} onRestart={handleRestartGame} />
              </motion.div>
            ) : (
              /* 3. Main math game interface */
              <motion.div
                key="game-arena"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Player Profile & Stats Header */}
                <div className="flex items-center justify-between bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-100/50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <motion.button
                      id="btn-open-avatar-gallery"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sound.playTap();
                        setShowAvatarGallery(true);
                      }}
                      className="text-3.5xl p-1 bg-amber-50 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100 shadow-sm cursor-pointer relative group transition-colors flex items-center justify-center w-14 h-14"
                      title="Open Avatar Gallery!"
                    >
                      <span>{stats.avatar.emoji}</span>
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white shadow-sm group-hover:scale-110 transition-transform">
                        <Award className="w-2.5 h-2.5" />
                      </span>
                    </motion.button>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-wider">Buddy</span>
                        <motion.button
                          onClick={() => {
                            sound.playTap();
                            setShowAvatarGallery(true);
                          }}
                          className="text-[9px] font-extrabold bg-amber-100 hover:bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-0.5 cursor-pointer"
                        >
                          🐾 Gallery
                        </motion.button>
                      </div>
                      <div className="text-lg font-black text-amber-950 leading-none truncate max-w-[130px] mt-0.5">
                        {stats.playerName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Days in a row counter */}
                    {stats.loginStreak > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          sound.playTap();
                          setShowDailyBonusModal(true);
                        }}
                        className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-full text-emerald-700 font-extrabold text-[11px] cursor-pointer shadow-sm transition-all"
                        title="Daily Login Streak - Click to view rewards!"
                      >
                        <span className="text-xs">📅</span>
                        <span>{stats.loginStreak} {stats.loginStreak === 1 ? 'Day' : 'Days'}</span>
                      </motion.div>
                    )}

                    {/* Streak flame */}
                    {stats.streak > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="flex items-center gap-0.5 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-full text-orange-600 font-extrabold text-xs"
                        title="Streak Counter"
                      >
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span>{stats.streak}</span>
                      </motion.div>
                    )}

                    <SoundToggle
                      difficulty={stats.difficulty || 'medium'}
                      onDifficultyChange={(newDiff) => {
                        setStats((prev) => ({
                          ...prev,
                          difficulty: newDiff,
                        }));
                        setPuzzleIndex((prev) => prev + 1); // trigger fresh puzzle regeneration
                      }}
                    />
                  </div>
                </div>

                {/* Level Progress & Daily Missions (Hidden during active Quick Match to avoid clutter) */}
                {activeMode !== 'quick_match' && (
                  <>
                    {/* Level Progress Visual */}
                    <div className="bg-white/95 rounded-2xl p-4 border-2 border-amber-100/60 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">
                            LEVEL {stats.level} of 10
                          </span>
                          <h2 className="text-md font-extrabold text-amber-950">
                            {LEVEL_NAMES[stats.level - 1]}
                          </h2>
                        </div>
                        
                        {/* Stars count indicator */}
                        <div className="flex items-center gap-1 text-sm font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{stats.stars} Total</span>
                        </div>
                      </div>

                      {/* 3 Level Progress Stars */}
                      <div className="flex justify-between items-center pt-1.5">
                        <div className="flex gap-2">
                          {[1, 2, 3].map((starNum) => {
                            const isFilled = starsForCurrentLevel >= starNum;
                            return (
                              <motion.div
                                key={starNum}
                                animate={isFilled ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    isFilled
                                      ? 'text-yellow-500 fill-yellow-400 filter drop-shadow-sm'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                        <span className="text-xs font-bold text-amber-900/60">
                          {starsForCurrentLevel}/3 Stars to unlock Level {stats.level + 1}
                        </span>
                      </div>

                      {/* Cute progress bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-300"
                          style={{ width: `${levelProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Daily Missions Panel */}
                    <DailyMissions
                      missions={missions}
                      onClaim={handleClaimMission}
                      onRotate={handleRotateMissions}
                    />
                  </>
                )}

                {/* Quick Match Event Banner */}
                <div 
                  id="btn-quick-match-banner"
                  onClick={() => {
                    sound.playTap();
                    setActiveMode('quick_match');
                    setQuickMatchState('idle');
                  }}
                  className={`relative overflow-hidden rounded-2xl p-3.5 border-2 cursor-pointer transition-all ${
                    activeMode === 'quick_match'
                      ? 'bg-amber-950 border-amber-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 border-amber-400 text-amber-950 shadow-sm hover:scale-[1.02]'
                  }`}
                >
                  <div className="absolute right-[-10px] top-[-10px] opacity-25 text-5xl font-sans">⚡</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl animate-bounce">⚡</span>
                      <div>
                        <div className={`text-[9px] font-black uppercase tracking-wider ${activeMode === 'quick_match' ? 'text-amber-400' : 'text-amber-900/70'}`}>
                          Limited Arcade Event
                        </div>
                        <div className="text-sm font-black tracking-tight leading-tight">
                          60s Quick Match Challenge!
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${activeMode === 'quick_match' ? 'bg-amber-800 text-white shadow-sm border border-amber-700' : 'bg-white text-amber-950 shadow-sm border border-amber-200'}`}>
                      {activeMode === 'quick_match' ? 'Playing 🎮' : 'Play ⭐'}
                    </span>
                  </div>
                </div>

                {/* Game Mode Tab Buttons */}
                <div className="bg-amber-900/10 p-1.5 rounded-2xl grid grid-cols-4 gap-1 border border-amber-900/5">
                  {MODE_META.map((mode) => {
                    const isActive = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        id={`tab-mode-${mode.id}`}
                        onClick={() => {
                          sound.playTap();
                          setActiveMode(mode.id);
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-950 text-white shadow-md'
                            : 'bg-white/40 text-amber-950 hover:bg-white/80'
                        }`}
                      >
                        <span className="text-xl mb-0.5">{mode.icon}</span>
                        <span className="text-[10px] font-black tracking-tight">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* The Active Puzzle or Quick Match Screen */}
                {activeMode === 'quick_match' ? (
                  renderQuickMatch()
                ) : activePuzzle ? (
                  <GameCard
                    puzzle={activePuzzle}
                    onAnswer={handleAnswerResult}
                    stars={stats.stars}
                    onUseHint={handleUseHint}
                  />
                ) : (
                  <div className="text-center p-8 bg-white rounded-3xl border-4 border-amber-100 animate-pulse">
                    <HelpCircle className="w-12 h-12 text-amber-300 mx-auto mb-2 animate-spin" />
                    <span className="text-sm font-bold text-slate-500">Preparing Safari Puzzle...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom android pill button */}
          <div className="w-32 h-1.5 bg-slate-900/80 rounded-full mx-auto mt-4 shrink-0 shadow-inner" />
        </div>

        {/* Level Up Celebration Overlay */}
        <AnimatePresence>
          {isLevelingUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-gradient-to-b from-yellow-300 to-amber-500 border-6 border-white rounded-3xl p-5 shadow-2xl space-y-3 max-w-xs relative overflow-hidden"
              >
                {/* Sparkles effect */}
                <div className="absolute top-2 left-2 text-xl animate-spin-slow">✨</div>
                <div className="absolute bottom-2 right-2 text-xl animate-spin-slow">✨</div>

                <div className="bg-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-4 border-yellow-400 shadow-md">
                  <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-400 animate-bounce" />
                </div>

                <h2 className="text-2xl font-black text-amber-950 uppercase tracking-tight">
                  LEVEL UP! 🎉
                </h2>
                
                <p className="text-[10px] font-black text-amber-900 bg-white/80 py-1 px-2.5 rounded-full inline-block border border-amber-100">
                  Welcome to Level {stats.level + 1}! 🌟
                </p>

                <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                  Excellent math skills, {stats.playerName}! You unlocked <strong className="font-extrabold">{LEVEL_NAMES[stats.level]}</strong>!
                </p>

                {/* Level Progress Chart */}
                <LevelProgressChart history={starHistory} currentLevel={stats.level} />

                <motion.button
                  id="btn-level-proceed"
                  onClick={proceedToNextLevel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-amber-950 text-white font-extrabold py-3 rounded-xl border-b-4 border-amber-900 hover:brightness-115 transition-all shadow-md active:border-b-0 cursor-pointer text-sm"
                >
                  Proceed! 🚀
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Login Bonus Overlay */}
        <AnimatePresence>
          {showDailyBonusModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-white rounded-[32px] border-6 border-emerald-400 p-5 shadow-2xl space-y-4 max-w-[340px] w-full relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    sound.playTap();
                    setShowDailyBonusModal(false);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition-all border border-slate-200 text-xs"
                >
                  ✕
                </button>

                <div className="bg-gradient-to-tr from-emerald-500 to-green-400 p-3.5 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-4 border-white shadow-md">
                  <span className="text-3xl animate-bounce">🎁</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">
                    Daily Bonus!
                  </h2>
                  <p className="text-xs font-bold text-emerald-800">
                    Days in a row: <span className="bg-emerald-100 px-2 py-0.5 rounded-lg text-emerald-900 border border-emerald-200 font-black">{stats.loginStreak} 🔥</span>
                  </p>
                </div>

                {/* 7-Day Road Track Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    const cycleDay = ((stats.loginStreak - 1) % 7) + 1;
                    const isToday = dayNum === cycleDay;
                    const isClaimed = dayNum < cycleDay || (dayNum === cycleDay && dailyBonusClaimedToday);
                    const isLocked = dayNum > cycleDay;
                    const rewardVal = DAILY_REWARDS[dayNum - 1];

                    let cardBg = "bg-slate-50 border-slate-200 text-slate-400";
                    let emoji = "🔒";

                    if (isToday) {
                      if (dailyBonusClaimedToday) {
                        cardBg = "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold";
                        emoji = "✅";
                      } else {
                        cardBg = "bg-amber-100 border-amber-400 text-amber-950 font-black animate-pulse shadow-sm";
                        emoji = "🎁";
                      }
                    } else if (isClaimed) {
                      cardBg = "bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold";
                      emoji = "✅";
                    }

                    return (
                      <div
                        key={dayNum}
                        className={`border-2 rounded-2xl p-2 flex flex-col items-center justify-between min-h-[70px] relative transition-all ${cardBg} ${dayNum === 7 ? 'col-span-2' : ''}`}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider block">
                          Day {dayNum}
                        </span>
                        <span className="text-lg my-1">{emoji}</span>
                        <span className="text-[10px] font-extrabold text-amber-950">
                          +{rewardVal}⭐
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {/* Claim Button */}
                  {!dailyBonusClaimedToday ? (
                    <motion.button
                      id="btn-claim-daily-bonus"
                      onClick={() => {
                        sound.playStar();
                        const todayStr = getTodayString();
                        localStorage.setItem('safari_math_last_claimed_date', todayStr);
                        setDailyBonusClaimedToday(true);

                        const currentRewardIndex = (stats.loginStreak - 1) % DAILY_REWARDS.length;
                        const bonusStars = DAILY_REWARDS[currentRewardIndex];

                        setStats((prev) => {
                          const nextStars = prev.stars + bonusStars;
                          const updated = {
                            ...prev,
                            stars: nextStars,
                          };
                          localStorage.setItem('safari_math_user_stats', JSON.stringify(updated));
                          return updated;
                        });

                        // Play tap / feedback
                        sound.playSuccess();
                        
                        // Close modal after brief visual feedback
                        setTimeout(() => {
                          setShowDailyBonusModal(false);
                        }, 800);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl border-b-4 border-emerald-800 shadow-md cursor-pointer text-sm animate-pulse"
                    >
                      CLAIM TODAY'S REWARD! 🎁⭐
                    </motion.button>
                  ) : (
                    <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold py-3 rounded-2xl text-xs font-black">
                      🎉 ALL CLAIMED TODAY! Come back tomorrow!
                    </div>
                  )}

                  {/* Simulator Testing Button */}
                  <motion.button
                    id="btn-simulate-next-day"
                    onClick={() => {
                      sound.playTap();
                      const yesterdayStr = getYesterdayString();
                      
                      // Update stats locally
                      const updated = {
                        ...stats,
                        lastLoginDate: yesterdayStr,
                      };
                      setStats(updated);
                      localStorage.setItem('safari_math_user_stats', JSON.stringify(updated));
                      localStorage.setItem('safari_math_last_claimed_date', yesterdayStr);
                      
                      // Toggle claimed status to allow claiming immediately
                      setDailyBonusClaimedToday(false);
                      
                      // Trigger daily login checker logic
                      checkDailyLogin(updated);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-dashed border-amber-300 text-amber-900 font-extrabold py-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1.5"
                    title="Developer Tool: Simulate passing 24 hours to test consecutive day logins!"
                  >
                    <span>🧪</span>
                    <span>Simulate Next Day (Testing)</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Gallery Modal */}
        <AnimatePresence>
          {showAvatarGallery && (
            <AvatarGallery
              stats={stats}
              onSelectAvatar={(avatar) => {
                setStats((prev) => ({
                  ...prev,
                  avatar,
                }));
                sound.playSuccess();
              }}
              onClose={() => {
                setShowAvatarGallery(false);
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
