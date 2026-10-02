export const SYMBOL_CONFIGS = [
  { id: 'dice.png', weight: 20, payouts: { 3: 5, 4: 15, 5: 50 } },
  { id: 'spray_can.png', weight: 16, payouts: { 3: 5, 4: 20, 5: 60 } },
  { id: 'letter_a.png', weight: 76, payouts: { 3: 2, 4: 5, 5: 15 } },
  { id: 'letter_k.png', weight: 76, payouts: { 3: 2, 4: 5, 5: 15 } },
  { id: 'crossed_heart.png', weight: 4, payouts: { 3: 10, 4: 30, 5: 100 } },
  { id: 'boombox.png', weight: 2, payouts: { 3: 15, 4: 40, 5: 150 } },
  { id: 'crown.png', weight: 1, payouts: { 3: 25, 4: 80, 5: 300 } },
  { id: 'coin.png', weight: 1, payouts: { 3: 30, 4: 100, 5: 500 } },
  { id: 'vs_wild.png', weight: 4, payouts: { 3: 50, 4: 200, 5: 1000 }, isWild: true },
];

export function pickRandomSymbol(random = Math.random) {
  const totalWeight = SYMBOL_CONFIGS.reduce((total, config) => total + config.weight, 0);
  let roll = random() * totalWeight;
  for (const config of SYMBOL_CONFIGS) {
    if (roll < config.weight) return config.id;
    roll -= config.weight;
  }
  return SYMBOL_CONFIGS[SYMBOL_CONFIGS.length - 1].id;
}

export const PAYLINES = [
  { id: 1, rows: [1, 1, 1, 1, 1], color: '#ff3b30' },
  { id: 2, rows: [0, 0, 0, 0, 0], color: '#a8ff00' },
  { id: 3, rows: [2, 2, 2, 2, 2], color: '#168cff' },
  { id: 4, rows: [0, 1, 2, 1, 0], color: '#ffe600' },
  { id: 5, rows: [2, 1, 0, 1, 2], color: '#ff26d7' },
  { id: 6, rows: [1, 2, 2, 2, 1], color: '#00e5ff' },
  { id: 7, rows: [1, 0, 0, 0, 1], color: '#ff9417' },
  { id: 8, rows: [2, 1, 1, 1, 2], color: '#00eb91' },
  { id: 9, rows: [0, 1, 1, 1, 0], color: '#b329ff' },
];

const WILD_SYMBOL_ID = 'vs_wild.png';

export function calculateTotalBet(betPerLine, activePaylineIds) {
  if (!Number.isFinite(betPerLine) || betPerLine <= 0) {
    throw new RangeError('The bet per line must be a positive number');
  }
  if (
    !Array.isArray(activePaylineIds) ||
    activePaylineIds.length === 0 ||
    new Set(activePaylineIds).size !== activePaylineIds.length ||
    activePaylineIds.some((id) => !PAYLINES.some((payline) => payline.id === id))
  ) {
    throw new RangeError('Select one or more unique valid paylines');
  }
  return betPerLine * activePaylineIds.length;
}

function evaluatePayline(symbols, bet) {
  let bestWin = null;

  for (const config of SYMBOL_CONFIGS) {
    let matchCount = 0;
    for (const symbol of symbols) {
      if (symbol !== config.id && (config.isWild || symbol !== WILD_SYMBOL_ID)) {
        break;
      }
      matchCount += 1;
    }

    const multiplier = config.payouts[matchCount];
    if (multiplier && (!bestWin || multiplier > bestWin.multiplier)) {
      bestWin = {
        symbolId: config.id,
        matchCount,
        multiplier,
        payout: bet * multiplier,
      };
    }
  }

  return bestWin;
}

export function evaluateGrid(grid, betPerLine, activePaylineIds = PAYLINES.map(({ id }) => id)) {
  if (grid.length !== 5 || grid.some((reel) => reel.length !== 3)) {
    throw new RangeError('The slot grid must contain 5 reels with 3 rows each');
  }
  calculateTotalBet(betPerLine, activePaylineIds);
  const activePaylines = PAYLINES.filter(({ id }) => activePaylineIds.includes(id));

  const wins = activePaylines.flatMap((payline) => {
    const symbols = payline.rows.map((row, reelIndex) => grid[reelIndex][row]);
    const win = evaluatePayline(symbols, betPerLine);
    return win ? [{ line: payline.id, ...win }] : [];
  });

  return {
    wins,
    totalWin: wins.reduce((total, win) => total + win.payout, 0),
  };
}
