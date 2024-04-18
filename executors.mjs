import { EffectType } from "./enums.mjs";
import {
  empty1To9s,
  rowCol2SquareNum,
  squareNum2RowCol,
} from "./techniques.mjs";

export const fillAllEnableCandidates = (board) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value > 0) board[i][j].candidates = [];
      else {
        const usedValues = new Set();
        const squareOrigin = [Math.floor(i / 3) * 3, Math.floor(j / 3) * 3];
        for (let k = 0; k < 9; k++) {
          usedValues.add(board[i][k].value);
          usedValues.add(board[k][j].value);
          usedValues.add(
            board[squareOrigin[0] + (k % 3)][
              squareOrigin[1] + Math.floor(k / 3)
            ].value
          );
        }
        board[i][j].candidates = empty1To9s()
          .filter((item) => !usedValues.has(item))
          .sort();
      }
    }
  }
};

// put value and remove the value from the candidates on the same row, col, square
export const putValueOnCell = (board, answer) => {
  const { value, pos } = answer;
  //   put the value
  board[pos[0]][pos[1]].value = value;

  const { square } = rowCol2SquareNum(pos[0], pos[1]);
  for (let i = 0; i < 9; i++) {
    // EffectType.ROW
    if (i == pos[1]) board[pos[0]][i].candidates = [];
    else
      board[pos[0]][i].candidates = board[pos[0]][i].candidates.filter(
        (item) => item !== value
      );

    //  EffectType.COL
    if (i == pos[0]) board[i][pos[1]].candidates = [];
    else
      board[i][pos[1]].candidates = board[i][pos[1]].candidates.filter(
        (item) => item !== value
      );

    //  EffectType.SQUARE
    const { row, col } = squareNum2RowCol(square, i);
    if (row == pos[0] && col == pos[1]) board[row][col].candidates = [];
    else
      board[row][col].candidates = board[row][col].candidates.filter(
        (item) => item !== value
      );
  }
};

export const eliminateCandidates = (board, answer) => {
  const { cells, index, type, values } = answer;

  if (type === EffectType.ROW) {
    for (let i = 0; i < 9; i++) {
      // continue when the pattern cells
      if (!cells.includes(i))
        board[index][i].candidates = board[index][i].candidates.filter(
          (item) => !values.includes(item)
        );
    }
  } else if (type === EffectType.COL) {
    for (let i = 0; i < 9; i++) {
      // continue when the pattern cells
      if (!cells.includes(i))
        board[i][index].candidates = board[i][index].candidates.filter(
          (item) => !values.includes(item)
        );
    }
  } else if (type === EffectType.SQUARE) {
    for (let i = 0; i < 9; i++) {
      const { row, col } = squareNum2RowCol(index, i);
      // continue when the pattern cells
      if (!cells.includes(i))
        board[row][col].candidates = board[row][col].candidates.filter(
          (item) => !values.includes(item)
        );
    }
  }
};

// technique 7
// based on values, candidates of cells
export const executeHiddenSingles = (board, answer) => {
  const { value, type, index, cell } = answer;
  if (type === EffectType.ROW) {
    putValueOnCell(board, { value, pos: [index, cell] });
  } else if (type === EffectType.COL) {
    putValueOnCell(board, { value, pos: [cell, index] });
  } else if (type === EffectType.SQUARE) {
    const { row, col } = squareNum2RowCol(index, cell);
    putValueOnCell(board, { value, pos: [row, col] });
  }
};

export const eliminateSelfCandidates = (board, answer) => {
  const { values, type, index, cells } = answer;
  if (type === EffectType.ROW) {
    cells.forEach((cell) => {
      board[index][cell].candidates = board[index][cell].candidates.filter(
        (item) => !values.includes(item)
      );
    });
  } else if (type === EffectType.COL) {
    cells.forEach((cell) => {
      board[cell][index].candidates = board[cell][index].candidates.filter(
        (item) => !values.includes(item)
      );
    });
  } else if (type === EffectType.SQUARE) {
    cells.forEach((cell) => {
      const { row, col } = squareNum2RowCol(index, cell);
      board[row][col].candidates = board[row][col].candidates.filter(
        (item) => !values.includes(item)
      );
    });
  }
};

// technique 13
// based on values, candidates of cells
export const executeXWing = (board, answer) => {
  const { value, cells } = answer;
  cells.forEach((cell) => {
    board[cell[0]][cell[1]].candidates = board[cell[0]][
      cell[1]
    ].candidates.filter((item) => value !== item);
  });
};

// technique 12
// based on values, candidates of cells
export const executeYWing = (board, answer) => {
  const { value, cell } = answer;
  board[cell[0]][cell[1]].candidates = board[cell[0]][
    cell[1]
  ].candidates.filter((item) => value !== item);
};

// technique 14
// based on values, candidates of cells
export const executeSwordfish = (board, answer) => {};

export const replaceValueWithOldBoard = (oldBoard, newBoard) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      oldBoard[i][j].value = newBoard[i][j].value;
    }
  }
};
