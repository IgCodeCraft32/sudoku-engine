import {
  CellBg,
  CellColor,
  GameMode,
  GameConfig,
  TECHNIQUES,
  CellType,
} from "./enums";
import { fillAllEnableCandidates } from "./executors";
import { checkBoardStatus } from "./techniques";

// check the background colors of each cell
export const checkCellColors = (board, row, col, isNoteMode) => {
  // check the background colors of each cell
  let selectedValue = board[row][col].value;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].type === CellType.FAILED) {
        board[i][j].bgMode =
          i === row && j === col ? CellBg.SELECTED : CellBg.FAILED;
        board[i][j].colorMode = CellColor.FAILED;
        continue;
      }

      const isSameRow = i === row;
      const isSameCol = j === col;
      const isSameSquare = isInSameSquare(i, j, row, col);

      board[i][j].bgMode =
        isSameRow || isSameCol || isSameSquare
          ? isSameRow && isSameCol
            ? CellBg.SELECTED
            : CellBg.RELATED
          : CellBg.EMPTY;

      if (
        selectedValue > 0 &&
        selectedValue === board[i][j].value &&
        board[i][j].bgMode !== CellBg.SELECTED
      )
        board[i][j].bgMode = CellBg.SAME;

      board[i][j].colorMode = CellColor.NORMAL;
    }
  }

  emphasisSameValue(board);

  removeCandidatesFromCell(board, row, col, isNoteMode);
};

export const emphasisSameValue = (board) => {
  let stacks = new Array(9).fill(0).map(() => []);
  // check the failed cells
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value > 0) stacks[board[i][j].value - 1].push({ i, j });
    }
  }
  stacks.forEach((stack) => {
    if (stack.length > 1) {
      stack
        .map(({ i, j }, _, arr) => ({
          i,
          j,
          isFailed:
            arr.filter(
              (b) =>
                b.i === i ||
                b.j === j ||
                (Math.floor(i / 3) === Math.floor(b.i / 3) &&
                  Math.floor(j / 3) === Math.floor(b.j / 3)),
            ).length > 1,
        }))
        .filter(({ isFailed }) => isFailed)
        .forEach(({ i, j }) => {
          if (board[i][j].bgMode !== CellBg.SELECTED) {
            board[i][j].bgMode = CellBg.FAILED;
          }
          board[i][j].colorMode = CellColor.FAILED;
        });
    }
  });
};

export const removeCandidatesFromCell = (board, row, col, isNoteMode) => {
  let selectedValue = board[row][col].value;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const isSameRow = i === row;
      const isSameCol = j === col;
      const isSameSquare =
        Math.floor(i / 3) === Math.floor(row / 3) &&
        Math.floor(j / 3) === Math.floor(col / 3);

      if (selectedValue > 0 && !isNoteMode) {
        // remove related candidates
        if (isSameRow || isSameCol || isSameSquare)
          board[i][j].candidates = board[i][j].candidates.filter(
            (item) => item !== selectedValue,
          );
        if (isSameRow && isSameCol) board[i][j].candidates = [];
      }
    }
  }
};

// create new game for each difficulty
export const createNewGame = (mode = GameMode.CLASSIC, difficulty = "Easy") => {
  const difficultyIndex = GameConfig[mode].difficulty.indexOf(difficulty);
  const blanks = GameConfig[mode].filled[difficultyIndex];
  const minPoints = GameConfig[mode].horizon[difficultyIndex];
  const maxPoints = GameConfig[mode].horizon[difficultyIndex + 1];
  while (true) {
    const newBoard = generateBlindSolvedBoard(
      blanks + Math.floor(Math.random() * 20),
    );

    const formatedBoard = formatBoardCellsForGame(newBoard);

    // solve generated sudoku
    const { points } = checkDifficulty(formatedBoard);
    console.log(points);
    if (points && points > minPoints && points < maxPoints) {
      return formatedBoard;
    }
  }
};

export const checkDifficulty = (board) => {
  if (!board) return false;

  const boardClone = cloneBoard(board);
  const usedTechniques = [];

  // use candidates from technique 1
  let currentTechnique = 0;

  // fill the correct candidates
  fillAllEnableCandidates(boardClone);

  while (currentTechnique < TECHNIQUES.length) {
    if (checkBoardStatus(boardClone)) break;

    const answers = TECHNIQUES[currentTechnique].check(boardClone);
    if (answers.length > 0) {
      // execute the function
      TECHNIQUES[currentTechnique].execute(boardClone, answers[0]);
      // record the techniques
      usedTechniques.push(currentTechnique);
      currentTechnique = 0;
      continue;
    }

    // seek next fuction
    currentTechnique++;
  }

  let points = 0;

  usedTechniques.forEach((item) => {
    points += TECHNIQUES[item].rate;
  });

  if (checkBoardStatus(boardClone)) {
    return { points, usedTechniques };
  } else return false;
};

export const oneHint = (board) => {
  if (!board) return false;

  const boardClone = cloneBoard(board);

  // use candidates from technique 1
  let currentTechnique = 0;

  // fill the correct candidates
  fillAllEnableCandidates(boardClone);

  while (currentTechnique < TECHNIQUES.length) {
    if (checkBoardStatus(boardClone)) break;

    const answers = TECHNIQUES[currentTechnique].check(boardClone);
    if (answers.length > 0) {
      // execute the function
      TECHNIQUES[currentTechnique].execute(boardClone, answers[0]);
      // record the techniques
      return {
        currentTechnique,
        answer: answers[0],
        board: boardClone,
      };
    }

    // seek next fuction
    currentTechnique++;
  }
  return false;
};

const generateBlindSolvedBoard = (numberOfBlanks) => {
  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (board[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  function blindSudokuSolver(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const newSet = shuffle(new Array(9).fill(0).map((_, idx) => idx + 1));
          for (let num = 0; num < 9; num++) {
            if (isValid(board, row, col, newSet[num])) {
              board[row][col] = newSet[num];
              if (blindSudokuSolver(board)) {
                return true;
              }
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function fillCellsByZero(board, count) {
    const emptyArray = Array.from({ length: 81 }, (_, idx) => idx);
    const blanks = shuffle(emptyArray).slice(count);
    blanks.forEach((item) => {
      board[Math.floor(item / 9)][item % 9] = 0;
    });
  }

  const board = getEmpty9x9Board();

  blindSudokuSolver(board);
  fillCellsByZero(board, numberOfBlanks);

  return board;
};

// global functions
const getEmpty9x9Board = () =>
  new Array(9).fill(0).map(() => new Array(9).fill(0));

const isInSameSquare = (i, j, i2, j2) =>
  Math.floor(i / 3) === Math.floor(i2 / 3) &&
  Math.floor(j / 3) === Math.floor(j2 / 3);

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

export const pureClone = (item) =>
  JSON.parse(
    JSON.stringify({ value: item.value, candidates: item.candidates }),
  );

export const cloneBoard = (board) => JSON.parse(JSON.stringify(board));

const formatBoardCellsForGame = (board) =>
  board.map((row) =>
    row.map((value) => ({
      value,
      candidates: [],
      type: value > 0 ? CellType.PUZZLE : CellType.NORMAL,
    })),
  );

export const hasDuplicates = (arr) => new Set(arr).size !== arr.length;
