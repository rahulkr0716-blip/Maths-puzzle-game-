/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Puzzle, GameMode, Difficulty } from '../types';

// Helper to generate a random integer in [min, max]
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to shuffle an array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generatePuzzle(mode: GameMode, level: number, difficulty: Difficulty = 'medium'): Puzzle {
  const id = `${mode}_l${level}_${Math.random().toString(36).substring(2, 7)}`;
  let questionText = '';
  let options: string[] = [];
  let correctAnswer = '';

  switch (mode) {
    case 'quick_match': {
      const subModes: Exclude<GameMode, 'quick_match'>[] = ['balloons', 'sequences', 'balance', 'grid'];
      const randomSubMode = subModes[Math.floor(Math.random() * subModes.length)];
      const basePuzzle = generatePuzzle(randomSubMode, level, difficulty);
      return {
        ...basePuzzle,
        id,
        mode: 'quick_match',
      };
    }

    case 'balloons': {
      // Balloon Pop: Basic Arithmetic (+, -, ×)
      let num1 = 0;
      let num2 = 0;
      let operator: '+' | '-' | '×' = '+';
      let answer = 0;

      if (difficulty === 'easy') {
        // Simple operations only, smaller numbers
        const ops: ('+' | '-')[] = ['+', '-'];
        operator = ops[Math.floor(Math.random() * ops.length)];
        if (operator === '+') {
          num1 = randInt(1, 6);
          num2 = randInt(1, 6);
          answer = num1 + num2;
        } else {
          num1 = randInt(2, 8);
          num2 = randInt(1, num1 - 1);
          answer = num1 - num2;
        }
      } else if (difficulty === 'hard') {
        // Multi-digit arithmetic and hard multiplication
        const ops: ('+' | '-' | '×')[] = ['+', '-', '×'];
        operator = ops[Math.floor(Math.random() * ops.length)];
        if (operator === '+') {
          num1 = randInt(30, 120);
          num2 = randInt(20, 100);
          answer = num1 + num2;
        } else if (operator === '-') {
          num1 = randInt(80, 200);
          num2 = randInt(30, num1 - 10);
          answer = num1 - num2;
        } else {
          // Hard tables: 6, 7, 8, 9, 11, 12
          const tables = [6, 7, 8, 9, 11, 12];
          num1 = tables[Math.floor(Math.random() * tables.length)];
          num2 = randInt(4, 12);
          answer = num1 * num2;
        }
      } else {
        // Standard (Medium) difficulty
        if (level <= 2) {
          // Simple addition/subtraction
          operator = Math.random() > 0.5 ? '+' : '-';
          if (operator === '+') {
            num1 = randInt(1, 8);
            num2 = randInt(1, 8);
            answer = num1 + num2;
          } else {
            num1 = randInt(2, 10);
            num2 = randInt(1, num1 - 1); // Avoid negative answers for small children
            answer = num1 - num2;
          }
        } else if (level <= 5) {
          // Introduce simple multiplication (tables of 2, 5, 10)
          const ops: ('+' | '-' | '×')[] = level >= 4 ? ['+', '-', '×'] : ['+', '-'];
          operator = ops[Math.floor(Math.random() * ops.length)];

          if (operator === '+') {
            num1 = randInt(5, 15);
            num2 = randInt(1, 15);
            answer = num1 + num2;
          } else if (operator === '-') {
            num1 = randInt(10, 20);
            num2 = randInt(1, num1);
            answer = num1 - num2;
          } else {
            const tables = [2, 3, 5, 10];
            num1 = tables[Math.floor(Math.random() * tables.length)];
            num2 = randInt(1, 6);
            answer = num1 * num2;
          }
        } else {
          // Harder sums and multiplication tables up to 10
          const ops: ('+' | '-' | '×')[] = ['+', '-', '×'];
          operator = ops[Math.floor(Math.random() * ops.length)];

          if (operator === '+') {
            num1 = randInt(15, 45);
            num2 = randInt(10, 45);
            answer = num1 + num2;
          } else if (operator === '-') {
            num1 = randInt(30, 80);
            num2 = randInt(10, num1 - 5);
            answer = num1 - num2;
          } else {
            num1 = randInt(2, 9);
            num2 = randInt(3, 9);
            answer = num1 * num2;
          }
        }
      }

      questionText = `What is ${num1} ${operator} ${num2}?`;
      correctAnswer = answer.toString();

      // Generate options
      const opts = new Set<number>([answer]);
      while (opts.size < 4) {
        // Generate values close to answer
        const dev = randInt(-4, 4);
        const alt = answer + dev;
        if (alt >= 0 && alt !== answer) {
          opts.add(alt);
        }
      }
      options = shuffle(Array.from(opts)).map(o => o.toString());

      return {
        id,
        mode,
        questionText,
        options,
        correctAnswer,
        balloonData: { num1, num2, operator },
      };
    }

    case 'sequences': {
      // Sequence Detective: Find the missing number in the sequence
      let numbers: (number | string)[] = [];
      let step = 1;
      let start = 1;
      let length = 4;
      let missingIndex = 2; // Default third index

      if (difficulty === 'easy') {
        step = Math.random() > 0.5 ? 1 : 2;
        start = randInt(1, 5);
        length = 4;
        missingIndex = randInt(1, 2);
      } else if (difficulty === 'hard') {
        step = [-4, -7, 7, 12, 15][Math.floor(Math.random() * 5)];
        start = step < 0 ? randInt(40, 80) : randInt(5, 30);
        length = 5;
        missingIndex = randInt(1, 4);
      } else {
        // Standard medium difficulty
        if (level <= 2) {
          step = 1;
          start = randInt(1, 8);
          missingIndex = randInt(1, 3);
        } else if (level <= 5) {
          step = Math.random() > 0.5 ? 2 : 5;
          start = randInt(1, 15);
          length = 4;
          missingIndex = randInt(1, 3);
        } else if (level <= 8) {
          step = [3, 4, 10][Math.floor(Math.random() * 3)];
          start = randInt(1, 25);
          length = 5;
          missingIndex = randInt(1, 4);
        } else {
          // Hard levels
          step = [-2, -5, 6, 8, 9][Math.floor(Math.random() * 5)];
          start = step < 0 ? randInt(20, 50) : randInt(1, 30);
          length = 5;
          missingIndex = randInt(1, 4);
        }
      }

      const seqVals: number[] = [];
      for (let i = 0; i < length; i++) {
        seqVals.push(start + i * step);
      }

      const targetAns = seqVals[missingIndex];
      correctAnswer = targetAns.toString();

      numbers = seqVals.map((val, idx) => (idx === missingIndex ? '?' : val));
      questionText = 'What is the missing detective number?';

      const opts = new Set<number>([targetAns]);
      while (opts.size < 4) {
        const alt = targetAns + step * randInt(-2, 2) + randInt(-1, 1);
        if (alt !== targetAns) {
          opts.add(alt);
        }
      }
      options = shuffle(Array.from(opts)).map(o => o.toString());

      return {
        id,
        mode,
        questionText,
        options,
        correctAnswer,
        sequenceData: { numbers, missingIndex },
      };
    }

    case 'balance': {
      // Balance Scale: Compare Left Side vs Right Side with <, =, or >
      let leftVal = 0;
      let rightVal = 0;
      let leftDisplay = '';
      let rightDisplay = '';

      if (difficulty === 'easy') {
        // Just single small numbers to compare
        leftVal = randInt(1, 10);
        rightVal = randInt(1, 10);
        leftDisplay = leftVal.toString();
        rightDisplay = rightVal.toString();
      } else if (difficulty === 'hard') {
        // Mix of addition/subtraction and multiplication!
        const lMode = Math.random() > 0.5 ? 'mul' : 'add';
        const rMode = Math.random() > 0.5 ? 'mul' : 'sub';

        if (lMode === 'mul') {
          const m1 = randInt(2, 6);
          const m2 = randInt(3, 8);
          leftVal = m1 * m2;
          leftDisplay = `${m1} × ${m2}`;
        } else {
          const a1 = randInt(20, 60);
          const a2 = randInt(15, 40);
          leftVal = a1 + a2;
          leftDisplay = `${a1} + ${a2}`;
        }

        if (rMode === 'mul') {
          const m1 = randInt(2, 6);
          const m2 = randInt(3, 8);
          rightVal = m1 * m2;
          rightDisplay = `${m1} × ${m2}`;
        } else {
          const s1 = randInt(40, 100);
          const s2 = randInt(10, 35);
          rightVal = s1 - s2;
          rightDisplay = `${s1} - ${s2}`;
        }
      } else {
        // Standard medium difficulty
        if (level <= 2) {
          // Just single numbers to teach comparisons
          leftVal = randInt(1, 10);
          rightVal = randInt(1, 10);
          leftDisplay = leftVal.toString();
          rightDisplay = rightVal.toString();
        } else if (level <= 5) {
          // Sums or subtractions on one side, single number on other
          const modeChoice = Math.random();
          if (modeChoice < 0.5) {
            // Expression on left
            const n1 = randInt(1, 10);
            const n2 = randInt(1, 10);
            leftVal = n1 + n2;
            leftDisplay = `${n1} + ${n2}`;
            rightVal = randInt(leftVal - 3, leftVal + 3);
            rightDisplay = rightVal.toString();
          } else {
            // Expression on right
            leftVal = randInt(5, 15);
            leftDisplay = leftVal.toString();
            const n1 = randInt(5, 12);
            const n2 = randInt(1, 5);
            rightVal = n1 - n2;
            rightDisplay = `${n1} - ${n2}`;
          }
        } else {
          // Expressions on both sides!
          const op1 = Math.random() > 0.5 ? '+' : '-';
          const op2 = Math.random() > 0.5 ? '+' : '-';

          let l1 = 0, l2 = 0, r1 = 0, r2 = 0;

          if (op1 === '+') {
            l1 = randInt(5, 20);
            l2 = randInt(5, 20);
            leftVal = l1 + l2;
            leftDisplay = `${l1} + ${l2}`;
          } else {
            l1 = randInt(15, 30);
            l2 = randInt(2, 10);
            leftVal = l1 - l2;
            leftDisplay = `${l1} - ${l2}`;
          }

          if (op2 === '+') {
            r1 = randInt(5, 20);
            r2 = randInt(5, 20);
            rightVal = r1 + r2;
            rightDisplay = `${r1} + ${r2}`;
          } else {
            r1 = randInt(15, 30);
            r2 = randInt(2, 10);
            rightVal = r1 - r2;
            rightDisplay = `${r1} - ${r2}`;
          }
        }
      }

      if (leftVal < rightVal) {
        correctAnswer = '<';
      } else if (leftVal === rightVal) {
        correctAnswer = '=';
      } else {
        correctAnswer = '>';
      }

      questionText = 'Which sign balances the scale?';
      options = ['<', '=', '>'];

      return {
        id,
        mode,
        questionText,
        options,
        correctAnswer,
        balanceData: { leftVal, rightVal, leftDisplay, rightDisplay },
      };
    }

    case 'grid': {
      // Visual fruit equations puzzle: E.g., Apple + Apple = 6, Apple + Banana = 5. What is Banana?
      const fruits = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥑', '🍍', '🍒'];
      let chosenFruits = shuffle(fruits);

      let equations: { formula: string; result: number }[] = [];
      let targetEmoji = '';
      let items: { emoji: string; value: number }[] = [];

      if (difficulty === 'easy') {
        chosenFruits = chosenFruits.slice(0, 2);
        targetEmoji = chosenFruits[1];
        const v1 = randInt(1, 4);
        const v2 = randInt(1, 3);

        items = [
          { emoji: chosenFruits[0], value: v1 },
          { emoji: chosenFruits[1], value: v2 },
        ];

        equations.push({
          formula: `${chosenFruits[0]} + ${chosenFruits[0]}`,
          result: v1 + v1,
        });

        equations.push({
          formula: `${chosenFruits[0]} + ${chosenFruits[1]}`,
          result: v1 + v2,
        });

        correctAnswer = v2.toString();
      } else if (difficulty === 'hard') {
        chosenFruits = chosenFruits.slice(0, 3);
        targetEmoji = chosenFruits[2];
        const v1 = randInt(4, 9);
        const v2 = randInt(2, 6);
        const v3 = randInt(1, 5);

        items = [
          { emoji: chosenFruits[0], value: v1 },
          { emoji: chosenFruits[1], value: v2 },
          { emoji: chosenFruits[2], value: v3 },
        ];

        // Equation 1: Addition of Fruit1
        equations.push({
          formula: `${chosenFruits[0]} + ${chosenFruits[0]}`,
          result: v1 + v1,
        });

        // Equation 2: Multiplication!
        equations.push({
          formula: `${chosenFruits[0]} × ${chosenFruits[1]}`,
          result: v1 * v2,
        });

        // Equation 3: Addition or Subtraction of Fruit3
        const useSub = Math.random() > 0.5;
        if (useSub) {
          equations.push({
            formula: `${chosenFruits[1]} - ${chosenFruits[2]}`,
            result: v2 - v3,
          });
        } else {
          equations.push({
            formula: `${chosenFruits[1]} + ${chosenFruits[2]}`,
            result: v2 + v3,
          });
        }

        correctAnswer = v3.toString();
      } else {
        // Standard medium difficulty
        chosenFruits = chosenFruits.slice(0, level >= 6 ? 3 : 2);
        targetEmoji = chosenFruits[chosenFruits.length - 1]; // Always find the last fruit

        if (chosenFruits.length === 2) {
          // 2 Fruits (Easy/Medium Levels)
          const v1 = randInt(2, 6);
          const v2 = randInt(1, 5);

          items = [
            { emoji: chosenFruits[0], value: v1 },
            { emoji: chosenFruits[1], value: v2 },
          ];

          // Eq 1: Fruit1 + Fruit1 = v1 * 2
          equations.push({
            formula: `${chosenFruits[0]} + ${chosenFruits[0]}`,
            result: v1 + v1,
          });

          // Eq 2: Fruit1 + Fruit2 = v1 + v2
          equations.push({
            formula: `${chosenFruits[0]} + ${chosenFruits[1]}`,
            result: v1 + v2,
          });

          correctAnswer = v2.toString();
        } else {
          // 3 Fruits (Advanced Levels)
          const v1 = randInt(3, 8);
          const v2 = randInt(2, 6);
          const v3 = randInt(1, 5);

          items = [
            { emoji: chosenFruits[0], value: v1 },
            { emoji: chosenFruits[1], value: v2 },
            { emoji: chosenFruits[2], value: v3 },
          ];

          // Eq 1: Fruit1 + Fruit1 = v1 + v1
          equations.push({
            formula: `${chosenFruits[0]} + ${chosenFruits[0]}`,
            result: v1 + v1,
          });

          // Eq 2: Fruit1 - Fruit2 = v1 - v2
          equations.push({
            formula: `${chosenFruits[0]} - ${chosenFruits[1]}`,
            result: v1 - v2,
          });

          // Eq 3: Fruit2 + Fruit3 = v2 + v3
          equations.push({
            formula: `${chosenFruits[1]} + ${chosenFruits[2]}`,
            result: v2 + v3,
          });

          correctAnswer = v3.toString();
        }
      }

      const correctVal = parseInt(correctAnswer, 10);
      questionText = `Can you solve the puzzle? What is the value of ${targetEmoji}?`;

      // Options
      const opts = new Set<number>([correctVal]);
      while (opts.size < 4) {
        const alt = correctVal + randInt(-3, 3);
        if (alt >= 0 && alt !== correctVal) {
          opts.add(alt);
        }
      }
      options = shuffle(Array.from(opts)).map(o => o.toString());

      return {
        id,
        mode,
        questionText,
        options,
        correctAnswer,
        gridData: { items, equations, targetEmoji },
      };
    }

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}
