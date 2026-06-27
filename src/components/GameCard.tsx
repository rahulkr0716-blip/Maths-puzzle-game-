/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Puzzle, GameMode } from '../types';
import { sound } from '../utils/sound';
import { HelpCircle, ArrowRight, Scale, Search, Check, X, ShieldAlert } from 'lucide-react';

interface GameCardProps {
  puzzle: Puzzle;
  onAnswer: (isCorrect: boolean, selectedOption: string) => void;
  stars: number;
  onUseHint: () => void;
}

export default function GameCard({ puzzle, onAnswer, stars, onUseHint }: GameCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  // Reset local state when puzzle changes
  useEffect(() => {
    setSelected(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setUsedHint(false);
    setEliminatedOptions([]);
  }, [puzzle]);

  const handleUseHint = () => {
    if (isAnswered || usedHint) return;
    if (stars < 1) {
      sound.vibrate(100);
      return;
    }
    onUseHint();
    sound.playStar();
    sound.vibrate(50);
    setUsedHint(true);

    const incorrect = puzzle.options.filter((opt) => opt !== puzzle.correctAnswer);
    const countToEliminate = incorrect.length >= 3 ? 2 : 1;
    const shuffledIncorrect = [...incorrect].sort(() => 0.5 - Math.random());
    const eliminated = shuffledIncorrect.slice(0, countToEliminate);
    setEliminatedOptions(eliminated);
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    sound.playTap();
    sound.vibrate(10);
    setSelected(option);

    const correct = option === puzzle.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      sound.playSuccess();
      sound.vibrate(60);
    } else {
      sound.playFail();
      sound.vibrate(120);
    }

    // Delay callback so child can see the visual success/failure feedback state!
    setTimeout(() => {
      onAnswer(correct, option);
    }, 1800);
  };

  // Render Balloon Pop Game Mode
  const renderBalloons = () => {
    const balloonColors = [
      'bg-red-400 border-red-500 shadow-red-200 text-white',
      'bg-sky-400 border-sky-500 shadow-sky-200 text-white',
      'bg-amber-400 border-amber-500 shadow-amber-200 text-white',
      'bg-emerald-400 border-emerald-500 shadow-emerald-200 text-white',
    ];

    return (
      <div className="space-y-6">
        <div className="bg-sky-50 rounded-2xl p-6 border-4 border-sky-200 shadow-inner">
          <div className="text-sm font-black text-sky-600 uppercase tracking-widest mb-1">Pop the correct answer!</div>
          <div className="text-3xl font-black text-sky-900 tracking-tight">
            {puzzle.balloonData?.num1} {puzzle.balloonData?.operator} {puzzle.balloonData?.num2} = ?
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 relative min-h-[220px]">
          {puzzle.options.map((option, index) => {
            const colorClass = balloonColors[index % balloonColors.length];
            const isThisSelected = selected === option;
            const isThisCorrect = option === puzzle.correctAnswer;
            const isEliminated = eliminatedOptions.includes(option);

            return (
              <motion.button
                key={option}
                id={`balloon-${option}`}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered || isEliminated}
                whileHover={{ scale: (isAnswered || isEliminated) ? 1 : 1.05, y: (isAnswered || isEliminated) ? 0 : -5 }}
                whileTap={{ scale: (isAnswered || isEliminated) ? 1 : 0.95 }}
                animate={
                  isEliminated
                    ? { opacity: 0.15, scale: 0.75, y: 15 }
                    : isAnswered
                    ? isThisSelected
                      ? isThisCorrect
                        ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] } // Pop animation!
                        : { x: [-10, 10, -10, 10, 0] } // Shake sad animation
                      : { opacity: 0.5 }
                    : { y: [0, -8, 0] }
                }
                transition={
                  isAnswered || isEliminated
                    ? { duration: 0.5 }
                    : { repeat: Infinity, duration: 2 + index * 0.4, ease: 'easeInOut' }
                }
                className={`relative flex flex-col items-center justify-center p-6 rounded-t-full rounded-b-[80px] border-b-8 aspect-[4/5] ${colorClass} ${
                  isEliminated ? 'pointer-events-none filter grayscale' : 'cursor-pointer'
                } transition-all shadow-lg select-none`}
              >
                {/* Pop particles or explosion effect */}
                {isAnswered && isThisSelected && isThisCorrect && (
                  <div className="absolute inset-0 bg-yellow-300 rounded-full scale-125 opacity-0 animate-ping" />
                )}

                {usedHint && isThisCorrect && !isAnswered && (
                  <div className="absolute -top-3 -right-2 bg-amber-400 text-amber-950 font-black rounded-full px-2 py-0.5 border-2 border-white shadow-md text-[10px] animate-bounce flex items-center gap-0.5">
                    ✨ Pick Me!
                  </div>
                )}

                <div className="text-3xl font-black tracking-tight mb-1">{option}</div>
                {/* Balloon string */}
                <div className="absolute bottom-[-16px] w-1 h-5 bg-sky-200/60 rounded-full mx-auto" />

                {/* Status overlay */}
                {isAnswered && isThisSelected && (
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 border-2 border-current">
                    {isThisCorrect ? (
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-rose-600 font-bold" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Pattern/Sequences Mode
  const renderSequences = () => {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 rounded-2xl p-5 border-4 border-indigo-200 text-center">
          <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
            <Search className="w-4 h-4" /> Pattern Detective
          </div>
          <p className="text-sm font-bold text-indigo-800">Find the hidden number sequence stone!</p>
        </div>

        {/* Sequence Stones Row */}
        <div className="flex items-center justify-center gap-2 py-4">
          {puzzle.sequenceData?.numbers.map((num, idx) => {
            const isTarget = num === '?';
            return (
              <React.Fragment key={idx}>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-md font-black text-xl transition-all ${
                    isTarget
                      ? isAnswered
                        ? isCorrect
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-700 animate-bounce'
                          : 'border-rose-400 bg-rose-100 text-rose-700'
                        : 'border-dashed border-amber-400 bg-amber-50 text-amber-600 font-bold animate-pulse'
                      : 'border-indigo-400 bg-white text-indigo-900'
                  }`}
                >
                  {isTarget && isAnswered ? puzzle.correctAnswer : num}
                </motion.div>
                {idx < (puzzle.sequenceData?.numbers.length || 0) - 1 && (
                  <ArrowRight className="w-4 h-4 text-indigo-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Multi-choice options */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {puzzle.options.map((option) => {
            const isThisSelected = selected === option;
            const isThisCorrect = option === puzzle.correctAnswer;
            const isEliminated = eliminatedOptions.includes(option);

            return (
              <motion.button
                key={option}
                id={`sequence-opt-${option}`}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered || isEliminated}
                whileHover={{ scale: (isAnswered || isEliminated) ? 1 : 1.03 }}
                whileTap={{ scale: (isAnswered || isEliminated) ? 1 : 0.97 }}
                className={`relative p-4 rounded-xl border-4 text-xl font-black transition-all shadow-sm ${
                  isEliminated
                    ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-20 cursor-not-allowed pointer-events-none line-through'
                    : isAnswered
                    ? isThisSelected
                      ? isThisCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-200'
                        : 'border-rose-500 bg-rose-500 text-white shadow-rose-200'
                      : isThisCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-400 opacity-60'
                    : 'border-amber-200 bg-white text-amber-950 hover:border-amber-300'
                } ${
                  usedHint && isThisCorrect && !isAnswered ? 'ring-4 ring-amber-300 animate-pulse border-amber-400' : ''
                }`}
              >
                🔍 {option}
                {usedHint && isThisCorrect && !isAnswered && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-md font-black animate-bounce">
                    ✨ HERE!
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Balance Scale Mode
  const renderBalance = () => {
    // If answered correctly, the scale balances or tilts correctly.
    // If not answered yet, let's tilt it slightly depending on the actual values!
    let tiltAngle = 0;
    const lVal = typeof puzzle.balanceData?.leftVal === 'number' ? puzzle.balanceData.leftVal : 1;
    const rVal = typeof puzzle.balanceData?.rightVal === 'number' ? puzzle.balanceData.rightVal : 1;

    if (isAnswered) {
      // If user selected correctly, we show the scale balanced (or matching the chosen sign)
      if (selected === '=') tiltAngle = 0;
      else if (selected === '<') tiltAngle = 10;
      else if (selected === '>') tiltAngle = -10;
    } else {
      // Natural tilt based on mathematical weight
      if (lVal > rVal) tiltAngle = -10; // Left side down
      else if (lVal < rVal) tiltAngle = 10; // Right side down
      else tiltAngle = 0;
    }

    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 rounded-2xl p-5 border-4 border-emerald-200 text-center">
          <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
            <Scale className="w-4 h-4" /> Balance Scale
          </div>
          <p className="text-sm font-bold text-emerald-800">Choose the symbol that balances the weight!</p>
        </div>

        {/* Interactive scale canvas */}
        <div className="relative py-8 bg-amber-50/50 rounded-3xl border-2 border-amber-100 flex flex-col items-center justify-center overflow-hidden min-h-[160px]">
          {/* Main rotating bar */}
          <motion.div
            animate={{ rotate: tiltAngle }}
            transition={{ type: 'spring', stiffness: 80, damping: 10 }}
            className="w-4/5 h-3 bg-amber-800 rounded-full relative flex items-center justify-between px-6"
          >
            {/* Left plate */}
            <div className="absolute left-1 top-2 flex flex-col items-center transform -translate-x-1/2">
              <div className="w-0.5 h-10 bg-amber-600" />
              <div className="px-3 py-2 bg-white border-2 border-amber-600 rounded-xl shadow-md min-w-[70px] text-center">
                <span className="text-sm font-extrabold text-slate-800">{puzzle.balanceData?.leftDisplay}</span>
              </div>
            </div>

            {/* Scale sign indicator in center */}
            <div className="mx-auto bg-amber-900 w-8 h-8 rounded-full border-2 border-amber-100 flex items-center justify-center -translate-y-0.5 shadow-md">
              <span className="text-yellow-300 font-extrabold text-md">
                {isAnswered ? selected : '?'}
              </span>
            </div>

            {/* Right plate */}
            <div className="absolute right-1 top-2 flex flex-col items-center transform translate-x-1/2">
              <div className="w-0.5 h-10 bg-amber-600" />
              <div className="px-3 py-2 bg-white border-2 border-amber-600 rounded-xl shadow-md min-w-[70px] text-center">
                <span className="text-sm font-extrabold text-slate-800">{puzzle.balanceData?.rightDisplay}</span>
              </div>
            </div>
          </motion.div>

          {/* Scale stand base */}
          <div className="w-4 h-16 bg-amber-900 mt-2 rounded-t-full shadow-inner" />
          <div className="w-24 h-4 bg-amber-900 rounded-t-lg -mt-1 shadow-md" />
        </div>

        {/* Control options (<, =, >) */}
        <div className="flex justify-center gap-4 pt-2">
          {puzzle.options.map((option) => {
            const isThisSelected = selected === option;
            const isThisCorrect = option === puzzle.correctAnswer;
            const isEliminated = eliminatedOptions.includes(option);

            return (
              <motion.button
                key={option}
                id={`balance-opt-${option === '<' ? 'less' : option === '=' ? 'equal' : 'greater'}`}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered || isEliminated}
                whileHover={{ scale: (isAnswered || isEliminated) ? 1 : 1.05 }}
                whileTap={{ scale: (isAnswered || isEliminated) ? 1 : 0.95 }}
                className={`relative w-16 h-16 rounded-full border-4 text-3xl font-black flex items-center justify-center transition-all shadow-sm ${
                  isEliminated
                    ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-20 cursor-not-allowed pointer-events-none line-through'
                    : isAnswered
                    ? isThisSelected
                      ? isThisCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-rose-500 bg-rose-500 text-white'
                      : isThisCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-300 opacity-50'
                    : 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-300'
                } ${
                  usedHint && isThisCorrect && !isAnswered ? 'ring-4 ring-amber-300 animate-pulse border-amber-400 bg-amber-50' : ''
                }`}
              >
                {option}
                {usedHint && isThisCorrect && !isAnswered && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-md font-black animate-bounce">
                    ✨
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Shape Grid Mode (visual systems equations)
  const renderGrid = () => {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 rounded-2xl p-5 border-4 border-yellow-200 text-center">
          <div className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1">Fruit Puzzle Solver</div>
          <p className="text-xs font-bold text-yellow-800">Figure out the number value of each fruit!</p>
        </div>

        {/* Board of equations */}
        <div className="bg-amber-900 text-white border-8 border-amber-950 p-4 rounded-3xl shadow-lg relative font-mono text-lg space-y-2.5">
          <div className="absolute top-2 right-2 text-yellow-300 text-xs animate-pulse font-sans font-bold">✨ Chalkboard</div>
          
          {puzzle.gridData?.equations.map((eq, idx) => (
            <div key={idx} className="flex justify-center items-center gap-2 border-b border-dashed border-amber-800/60 pb-1.5 last:border-0 last:pb-0">
              <span className="tracking-widest font-black text-xl">{eq.formula}</span>
              <span className="text-yellow-400 font-extrabold">=</span>
              <span className="font-extrabold text-xl">{eq.result}</span>
            </div>
          ))}

          {/* Question target */}
          <div className="flex justify-center items-center gap-3 pt-3 mt-1 bg-amber-950/40 rounded-xl py-2">
            <span className="text-3xl animate-bounce duration-1000">{puzzle.gridData?.targetEmoji}</span>
            <span className="text-yellow-400 font-extrabold text-xl">=</span>
            <span className="bg-amber-800 border-2 border-amber-700 px-3 py-1 rounded-lg font-black text-xl text-yellow-300 animate-pulse">
              ?
            </span>
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {puzzle.options.map((option) => {
            const isThisSelected = selected === option;
            const isThisCorrect = option === puzzle.correctAnswer;
            const isEliminated = eliminatedOptions.includes(option);

            return (
              <motion.button
                key={option}
                id={`grid-opt-${option}`}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered || isEliminated}
                whileHover={{ scale: (isAnswered || isEliminated) ? 1 : 1.03 }}
                whileTap={{ scale: (isAnswered || isEliminated) ? 1 : 0.97 }}
                className={`relative p-4 rounded-xl border-4 text-xl font-black transition-all shadow-sm ${
                  isEliminated
                    ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-20 cursor-not-allowed pointer-events-none line-through'
                    : isAnswered
                    ? isThisSelected
                      ? isThisCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-rose-500 bg-rose-500 text-white'
                      : isThisCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-300 opacity-50'
                    : 'border-amber-200 bg-white text-amber-950 hover:border-amber-300'
                } ${
                  usedHint && isThisCorrect && !isAnswered ? 'ring-4 ring-amber-300 animate-pulse border-amber-400' : ''
                }`}
              >
                🍎 {option}
                {usedHint && isThisCorrect && !isAnswered && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-md font-black animate-bounce font-sans">
                    ✨ HERE!
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="game-card-container" className="w-full bg-white rounded-3xl border-4 border-amber-100 p-6 shadow-md relative overflow-hidden">
      {/* Decorative stars corner element */}
      <div className="absolute top-0 right-0 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1 rounded-bl-2xl flex items-center gap-1">
        <span className="text-yellow-600 font-bold text-xs">{stars} ⭐</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={puzzle.id}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-4"
        >
          {/* Main game modes */}
          {(puzzle.mode === 'balloons' || (puzzle.mode === 'quick_match' && puzzle.balloonData)) && renderBalloons()}
          {(puzzle.mode === 'sequences' || (puzzle.mode === 'quick_match' && puzzle.sequenceData)) && renderSequences()}
          {(puzzle.mode === 'balance' || (puzzle.mode === 'quick_match' && puzzle.balanceData)) && renderBalance()}
          {(puzzle.mode === 'grid' || (puzzle.mode === 'quick_match' && puzzle.gridData)) && renderGrid()}
        </motion.div>
      </AnimatePresence>

      {/* Hint Button */}
      {!isAnswered && (
        <div className="flex justify-center pt-4 animate-fade-in">
          <motion.button
            id="btn-use-hint"
            onClick={handleUseHint}
            disabled={stars < 1 || usedHint}
            whileHover={{ scale: stars >= 1 && !usedHint ? 1.05 : 1 }}
            whileTap={{ scale: stars >= 1 && !usedHint ? 0.95 : 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wide border-2 transition-all shadow-sm cursor-pointer ${
              usedHint
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                : stars >= 1
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 border-amber-400 text-amber-950 font-black'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="text-sm animate-pulse">💡</span>
            <span>{usedHint ? 'Hint Active!' : 'Use Hint (Cost: 1 ⭐)'}</span>
          </motion.button>
        </div>
      )}

      {/* Pop-up child feedback message */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center ${
              isCorrect ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 1 }}
              className="text-6xl mb-4"
            >
              {isCorrect ? '🌟' : '💡'}
            </motion.div>

            <h3 className="text-2xl font-black mb-2">
              {isCorrect
                ? ['Awesome!', 'Super Math Star!', 'Brilliant!', 'Keep it up!', 'Outstanding!'][
                    puzzle.id.charCodeAt(0) % 5
                  ]
                : ['Oops, let\'s try again!', 'You can do it!', 'So close!', 'Give it another try!', 'Math is fun, let\'s learn!'][
                    puzzle.id.charCodeAt(0) % 5
                  ]}
            </h3>
            
            <p className="text-sm font-semibold max-w-xs text-slate-500">
              {isCorrect
                ? `You successfully solved the puzzle! Keep collecting golden stars.`
                : `The correct answer was indeed ${puzzle.correctAnswer}. Keep going to get the next one!`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
