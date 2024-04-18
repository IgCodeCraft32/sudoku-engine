import {
  findLastFreeCells,
  findLastPossibleNumber,
  findLastRemainingCell,
  findObvioussSingles,
  findObviousPairs,
  findObviousTriples,
  findHiddenSingles,
  findHiddenPairs,
  findHiddenTriples,
  findPointingPairs,
  findPointingTriples,
  findYWing,
  findXWing,
  findSwordfish,
} from "./techniques";

import {
  eliminateCandidates,
  executeHiddenSingles,
  eliminateSelfCandidates,
  executeYWing,
  executeXWing,
  putValueOnCell,
} from "./executors";

export const GameMode = {
  CLASSIC: 0,
  KILLER: 1,
};

export const GameConfig = {
  [GameMode.CLASSIC]: {
    difficulty: ["Easy", "Medium", "Hard", "Expert", "Master", "Extreme"],
    filled: [30, 25, 20, 15, 5, 0],
    horizon: [750, 1500, 3500, 4000, 6000, 8000, 99999],
  },
  [GameMode.KILLER]: {
    difficulty: ["Easy", "Medium", "Hard", "Expert"],
    filled: [30, 20, 10, 0],
  },
};

export const TECHNIQUES = [
  {
    name: "Last free cell",
    check: findLastFreeCells,
    execute: putValueOnCell,
    rate: 20,
  },
  {
    name: "Last remaining cell",
    check: findLastRemainingCell,
    execute: putValueOnCell,
    rate: 50,
  },
  {
    name: "Last possible number",
    check: findLastPossibleNumber,
    execute: putValueOnCell,
    rate: 150,
  },
  {
    name: "Obvious singles",
    check: findObvioussSingles,
    execute: putValueOnCell,
    rate: 100,
  },
  {
    name: "Obvious pairs",
    check: findObviousPairs,
    execute: eliminateCandidates,
    rate: 200,
  },
  {
    name: "Obvious triples",
    check: findObviousTriples,
    execute: eliminateCandidates,
    rate: 400,
  },
  {
    name: "Hidden singles",
    check: findHiddenSingles,
    execute: executeHiddenSingles,
    rate: 200,
  },
  {
    name: "Hidden pairs",
    check: findHiddenPairs,
    execute: eliminateSelfCandidates,
    rate: 400,
  },
  {
    name: "Hidden triples",
    check: findHiddenTriples,
    execute: eliminateSelfCandidates,
    rate: 800,
  },
  {
    name: "Pointing pairs",
    check: findPointingPairs,
    execute: eliminateCandidates,
    rate: 600,
  },
  {
    name: "Pointing triples",
    check: findPointingTriples,
    execute: eliminateCandidates,
    rate: 1000,
  },
  { name: "Х-wing", check: findXWing, execute: executeXWing, rate: 1000 },
  { name: "Y-wing", check: findYWing, execute: executeYWing, rate: 1200 },
  {
    name: "Swordfish",
    check: findSwordfish,
    execute: executeXWing,
    rate: 1800,
  },
];

export const CellType = {
  NORMAL: 0,
  PUZZLE: 1,
  FAILED: 2,
};

export const CellBg = {
  EMPTY: 0,
  SELECTED: 1,
  SAME: 2,
  RELATED: 3,
  SOLVED: 4,
  FAILED: 5,
};

export const CellColor = {
  NORMAL: 0,
  FAILED: 1,
};

export const EffectType = {
  ROW: 0,
  COL: 1,
  SQUARE: 2,
};
