/**
 * Math Challenge Question & Answer Generator
 * Generates non-trivial math problems to prevent impulse unblocking.
 * Hashes answers using MD5 for secure comparison.
 */

if (typeof require !== 'undefined' && typeof md5 === 'undefined') {
  var md5 = require('./md5.js');
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathChallenge() {
  const problemTypes = ['algebra', 'arithmetic_multi', 'quadratic_simple', 'percentage_calc', 'static_bank'];
  const type = problemTypes[getRandomInt(0, problemTypes.length - 1)];

  if (type === 'static_bank' && typeof QUESTION_BANK !== 'undefined' && QUESTION_BANK.length > 0) {
    const idx = getRandomInt(0, QUESTION_BANK.length - 1);
    return QUESTION_BANK[idx];
  }

  let questionText = '';
  let numAnswer = 0;

  switch (type) {
    case 'algebra': {
      // Solve for x: A * x + B = C
      const x = getRandomInt(12, 45);
      const a = getRandomInt(4, 19);
      const b = getRandomInt(15, 95);
      const c = a * x + b;
      questionText = `Solve for x: ${a}x + ${b} = ${c}`;
      numAnswer = x;
      break;
    }
    case 'arithmetic_multi': {
      // (A * B) - (C * D)
      const a = getRandomInt(13, 49);
      const b = getRandomInt(12, 35);
      const c = getRandomInt(11, 28);
      const d = getRandomInt(9, 25);
      questionText = `Calculate: (${a} × ${b}) - (${c} × ${d})`;
      numAnswer = (a * b) - (c * d);
      break;
    }
    case 'quadratic_simple': {
      // A^2 + B * C - D
      const a = getRandomInt(11, 29);
      const b = getRandomInt(14, 38);
      const c = getRandomInt(7, 19);
      const d = getRandomInt(25, 120);
      questionText = `Evaluate: ${a}² + (${b} × ${c}) - ${d}`;
      numAnswer = (a * a) + (b * c) - d;
      break;
    }
    case 'percentage_calc': {
      // Find X% of Y + Z
      const mult = getRandomInt(3, 18);
      const percent = mult * 5; // e.g. 15%, 25%, 35%, 45%...
      const base = getRandomInt(8, 40) * 20; // Multiple of 20 so percentage is exact integer
      const add = getRandomInt(45, 230);
      questionText = `Calculate: ${percent}% of ${base} + ${add}`;
      numAnswer = Math.round((percent / 100) * base) + add;
      break;
    }
    default: {
      const a = getRandomInt(15, 60);
      const b = getRandomInt(12, 40);
      questionText = `Calculate: ${a} × ${b}`;
      numAnswer = a * b;
      break;
    }
  }

  const answerStr = String(numAnswer);
  const hash = typeof md5 === 'function' ? md5(answerStr) : answerStr;

  return {
    question: questionText,
    answerHash: hash
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateMathChallenge };
}
