import { describe, expect, test } from 'bun:test';
import {
  calculateTotalBet,
  evaluateGrid,
  PAYLINES,
  pickRandomSymbol,
} from './slotLogic';

const emptyGrid = (symbol = 'letter_a.png') =>
  Array.from({ length: 5 }, () => Array(3).fill(symbol));

describe('pickRandomSymbol', () => {
  test('weights common low-paying symbols more heavily than jackpot symbols', () => {
    expect(pickRandomSymbol(() => 0)).toBe('dice.png');
    expect(pickRandomSymbol(() => 0.1)).toBe('spray_can.png');
    expect(pickRandomSymbol(() => 0.18)).toBe('letter_a.png');
    expect(pickRandomSymbol(() => 0.56)).toBe('letter_k.png');
    expect(pickRandomSymbol(() => 0.94)).toBe('crossed_heart.png');
    expect(pickRandomSymbol(() => 0.96)).toBe('boombox.png');
    expect(pickRandomSymbol(() => 0.97)).toBe('crown.png');
    expect(pickRandomSymbol(() => 0.975)).toBe('coin.png');
    expect(pickRandomSymbol(() => 0.98)).toBe('vs_wild.png');
  });
});

describe('evaluateGrid', () => {
  test('calculates the total stake from bet per line and selected line count', () => {
    expect(calculateTotalBet(10, [1, 4, 9])).toBe(30);
    expect(() => calculateTotalBet(10, [])).toThrow('Select one or more unique valid paylines');
  });

  test('defines nine distinct five-reel paylines with valid row positions', () => {
    expect(PAYLINES).toHaveLength(9);
    expect(new Set(PAYLINES.map(({ rows }) => rows.join(','))).size).toBe(9);
    expect(PAYLINES.every(({ rows }) => rows.length === 5 && rows.every((row) => row >= 0 && row <= 2))).toBe(true);
  });

  test('pays the five-symbol multiplier for a left-to-right payline', () => {
    const grid = emptyGrid();

    expect(evaluateGrid(grid, 10, [1])).toEqual({
      wins: [
        { line: 1, symbolId: 'letter_a.png', matchCount: 5, multiplier: 15, payout: 150 },
      ],
      totalWin: 150,
    });
  });

  test('uses the configured three- and four-symbol multipliers', () => {
    const grid = emptyGrid('coin.png');
    grid[0][1] = 'letter_a.png';
    grid[1][1] = 'letter_a.png';
    grid[2][1] = 'letter_a.png';

    expect(evaluateGrid(grid, 10, [1]).wins.find((win) => win.line === 1)).toMatchObject({
      symbolId: 'letter_a.png',
      matchCount: 3,
      multiplier: 2,
      payout: 20,
    });

    grid[3][1] = 'letter_a.png';
    expect(evaluateGrid(grid, 10, [1]).wins.find((win) => win.line === 1)).toMatchObject({
      symbolId: 'letter_a.png',
      matchCount: 4,
      multiplier: 5,
      payout: 50,
    });
  });

  test('allows wilds to substitute for a standard symbol and stops matching at the first gap', () => {
    const grid = emptyGrid('coin.png');
    grid[1][1] = 'vs_wild.png';

    const result = evaluateGrid(grid, 2, [1]);

    expect(result.wins.find((win) => win.line === 1)).toEqual({
      line: 1,
      symbolId: 'coin.png',
      matchCount: 5,
      multiplier: 500,
      payout: 1000,
    });

    grid[2][1] = 'dice.png';
    expect(evaluateGrid(grid, 2, [1]).wins.some((win) => win.line === 1)).toBe(false);
  });

  test('uses the wild paytable for an all-wild line', () => {
    const grid = emptyGrid();
    grid[0][1] = 'vs_wild.png';
    grid[1][1] = 'vs_wild.png';
    grid[2][1] = 'vs_wild.png';
    grid[3][1] = 'vs_wild.png';
    grid[4][1] = 'vs_wild.png';

    const result = evaluateGrid(grid, 3, [1]);

    expect(result.wins.find((win) => win.line === 1)).toEqual({
      line: 1,
      symbolId: 'vs_wild.png',
      matchCount: 5,
      multiplier: 1000,
      payout: 3000,
    });
  });

  test('evaluates the V and inverted-V paylines', () => {
    const grid = emptyGrid('dice.png');

    const result = evaluateGrid(grid, 1, [4, 5]);

    expect(result.wins.some((win) => win.line === 4 && win.symbolId === 'dice.png')).toBe(true);
    expect(result.wins.some((win) => win.line === 5 && win.symbolId === 'dice.png')).toBe(true);
  });

  test('pays only selected lines at the per-line bet and sums overlapping line wins', () => {
    const grid = emptyGrid('letter_a.png');
    const result = evaluateGrid(grid, 10, [2, 3]);

    expect(result.wins.map(({ line }) => line)).toEqual([2, 3]);
    expect(result.totalWin).toBe(300);
  });

  test('rejects invalid stakes and an empty active payline selection', () => {
    const grid = emptyGrid();

    expect(() => evaluateGrid(grid, 10, [])).toThrow('Select one or more unique valid paylines');
    expect(() => evaluateGrid(grid, 0, [1])).toThrow('The bet per line must be a positive number');
  });
});
