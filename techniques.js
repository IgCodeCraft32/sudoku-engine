import { hasDuplicates } from "./engine";
import { EffectType } from "./enums";

export const log = (name, answers) => {
  // if (answers.length > 0) console.log(name, answers);
};

export const empty0To8s = () => Array.from({ length: 9 }, (_, idx) => idx);
export const empty1To9s = () => Array.from({ length: 9 }, (_, idx) => idx + 1);

export const rowCol2SquareNum = (row, col) => ({
  square: Math.floor(row / 3) * 3 + Math.floor(col / 3),
  num: (row % 3) * 3 + (col % 3),
});

export const squareNum2RowCol = (square, num) => ({
  row: Math.floor(square / 3) * 3 + Math.floor(num / 3),
  col: (square % 3) * 3 + (num % 3),
});

export const checkBoardStatus = (board) => {
  // check blank cells
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value === 0) return false;
    }
  }

  // check duplicated cells
  for (let i = 0; i < 9; i++) {
    // EffectType.ROW
    if (hasDuplicates(empty0To8s().flatMap((j) => board[i][j].value)))
      return false;

    //  EffectType.COL
    if (hasDuplicates(empty0To8s().flatMap((j) => board[j][i].value)))
      return false;

    //  EffectType.SQUARE
    if (
      hasDuplicates(
        empty0To8s().flatMap((j) => {
          const { row, col } = squareNum2RowCol(i, j);
          return board[row][col].value;
        }),
      )
    )
      return false;
  }

  return true;
};

// technique 1
// based on values of cells
export const findLastFreeCells = (board) => {
  const answers = [];
  const empty1To9 = empty1To9s();

  for (let i = 0; i < 9; i++) {
    // check row
    let rowBlanks = [];
    let usedCells = new Set();
    for (let k = 0; k < 9; k++) {
      if (board[i][k].value === 0) {
        rowBlanks.push([i, k]);
      } else {
        usedCells.add(board[i][k].value);
      }
    }
    if (rowBlanks.length === 1) {
      answers.push({
        type: EffectType.ROW,
        index: i,
        pos: rowBlanks[0],
        value: empty1To9.find((item) => !usedCells.has(item)),
      });
    }

    // check col
    let colBlanks = [];
    usedCells = new Set();
    for (let k = 0; k < 9; k++) {
      if (board[k][i].value === 0) {
        colBlanks.push([k, i]);
      } else {
        usedCells.add(board[k][i].value);
      }
    }
    if (colBlanks.length === 1) {
      answers.push({
        type: EffectType.COL,
        index: i,
        pos: colBlanks[0],
        value: empty1To9.find((item) => !usedCells.has(item)),
      });
    }

    // check square
    let squareBlanks = [];
    usedCells = new Set();
    for (let k = 0; k < 9; k++) {
      let { row, col } = squareNum2RowCol(i, k);
      if (board[row][col].value === 0) {
        squareBlanks.push([row, col]);
      } else {
        usedCells.add(board[row][col].value);
      }
    }
    if (squareBlanks.length === 1) {
      answers.push({
        type: EffectType.SQUARE,
        index: i,
        pos: squareBlanks[0],
        value: empty1To9.find((item) => !usedCells.has(item)),
      });
    }
  }

  log("findLastFreeCells", answers);
  return answers;
};

export const isSameValueInRowAndCol = (board, row, col, value) => {
  // checked the candidate
  for (let i = 0; i < 9; i++) {
    if (board[row][i].value === value) {
      return {
        type: EffectType.ROW,
        index: row,
        pos: [row, i],
      };
    } else if (board[i][col].value === value) {
      return {
        type: EffectType.COL,
        index: col,
        pos: [i, col],
      };
    }
  }
  return false;
};

// technique 2
// based on values of cells
export const findLastRemainingCell = (board) => {
  const answers = [];

  // i = number of square
  for (let i = 0; i < 9; i++) {
    const remainingPos = [];
    const usedValues = new Set();
    for (let k = 0; k < 9; k++) {
      const { row, col } = squareNum2RowCol(i, k);
      if (board[row][col].value === 0) {
        remainingPos.push([row, col]);
      } else {
        usedValues.add(board[row][col].value);
      }
    }
    const remainingValues = empty1To9s().filter(
      (item) => !usedValues.has(item),
    );

    remainingPos.forEach((pos, idx) => {
      for (let j = 0; j < remainingValues.length; j++) {
        const value = remainingValues[j];

        // checked the candidate
        let hasSameValue = isSameValueInRowAndCol(board, pos[0], pos[1], value);
        if (hasSameValue) continue;

        // are the rest positions of remainingPos banned by the same value in the other squares
        let isAvailable = true;
        let pivots = [];
        for (let k = 0; k < remainingPos.length; k++) {
          if (k !== idx) {
            let effectedCell = isSameValueInRowAndCol(
              board,
              remainingPos[k][0],
              remainingPos[k][1],
              value,
            );
            if (effectedCell) pivots.push(effectedCell);
            else isAvailable = false;
          }
        }
        if (isAvailable) {
          const findUniqueItems = (items) => {
            const countMap = new Map();

            items.forEach(({ type, index, pos }) => {
              const key = JSON.stringify({ type, index, pos });
              if (!countMap.has(key)) countMap.set(key, { type, index, pos });
            });

            const uniqueItems = Array.from(countMap.values());
            return uniqueItems;
          };

          // if pivots.length === 0, those are the answer of findLastFreepivots
          answers.push({
            pos,
            index: i,
            value,
            pivots: findUniqueItems(pivots),
          });
        }
      }
    });
  }

  log("findLastRemainingCell", answers);
  return answers;
};

// technique 3
// based on values of cells
export const findLastPossibleNumber = (board) => {
  const answers = [];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value === 0) {
        const usedValues = new Set();
        const squareOrigin = [Math.floor(i / 3) * 3, Math.floor(j / 3) * 3];
        for (let k = 0; k < 9; k++) {
          usedValues.add(board[i][k].value);
          usedValues.add(board[k][j].value);
          usedValues.add(
            board[squareOrigin[0] + (k % 3)][
              squareOrigin[1] + Math.floor(k / 3)
            ].value,
          );
        }
        let candidates = empty1To9s().filter((item) => !usedValues.has(item));

        if (candidates.length === 1) {
          answers.push({ value: candidates[0], pos: [i, j] });
        }
      }
    }
  }

  log("findLastPossibleNumber", answers);
  return answers;
};

// technique 4
// based on values, candidates of cells
export const findObvioussSingles = (board) => {
  const answers = [];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value === 0 && board[i][j].candidates.length === 1) {
        answers.push({ value: board[i][j].candidates[0], pos: [i, j] });
      }
    }
  }

  log("findObvioussSingles", answers);
  return answers;
};

// technique 5
// based on values, candidates of cells
export const findObviousPairs = (board) => {
  const answers = [];
  const candidatesBySquare = new Map();

  // divide cell, that have only candidates and the number of its candidates are more than 2, into squares
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value === 0) {
        const { square } = rowCol2SquareNum(i, j);

        if (candidatesBySquare.has(square))
          candidatesBySquare
            .get(square)
            .push({ candidates: board[i][j].candidates, pos: [i, j] });
        else
          candidatesBySquare.set(square, [
            { candidates: board[i][j].candidates, pos: [i, j] },
          ]);
      }
    }
  }

  // implement the obvious pair technique
  candidatesBySquare.forEach((candidatesInSquare, squareNumber) => {
    let twoDigitCandidates = candidatesInSquare.filter(
      (item) => item.candidates.length === 2,
    );
    if (twoDigitCandidates.length >= 2) {
      const candidatesMap = new Map();
      twoDigitCandidates.forEach((item) => {
        const _key = item.candidates.join("-");
        if (candidatesMap.has(_key)) candidatesMap.get(_key).push(item);
        else candidatesMap.set(_key, [item]);
      });

      candidatesMap.forEach((items) => {
        if (items.length === 2) {
          const effectNumbers = items[0].candidates;
          const effectCountsInSquare = candidatesInSquare
            .flatMap((item) => item.candidates)
            .filter((item) => effectNumbers.includes(item));
          if (effectCountsInSquare.length > 4) {
            // effect to the square
            answers.push({
              type: EffectType.SQUARE,
              index: squareNumber,
              values: effectNumbers,
              cells: items.map(
                ({ pos }) => rowCol2SquareNum(pos[0], pos[1]).num,
              ),
            });
          }

          if (items[0].pos[0] === items[1].pos[0]) {
            // effect to the row
            const effectCountsInRow = empty0To8s()
              .flatMap((i) => board[items[0].pos[0]][i].candidates)
              .filter((item) => effectNumbers.includes(item));
            if (effectCountsInRow.length > 4) {
              answers.push({
                type: EffectType.ROW,
                index: items[0].pos[0],
                values: effectNumbers,
                cells: items.map(({ pos }) => pos[1]),
              });
            }
          } else if (items[0].pos[1] === items[1].pos[1]) {
            // effect to the col
            const effectCountsInCol = empty0To8s()
              .flatMap((i) => board[i][items[0].pos[1]].candidates)
              .filter((item) => effectNumbers.includes(item));
            if (effectCountsInCol.length > 4) {
              answers.push({
                type: EffectType.COL,
                index: items[0].pos[1],
                values: effectNumbers,
                cells: items.map(({ pos }) => pos[0]),
              });
            }
          }
        }
      });
    }
  });
  log("findObviousPairs", answers);
  return answers;
};

// technique 6
// based on values, candidates of cells
export const findObviousTriples = (board) => {
  const answers = [];
  const candidatesBySquare = new Map();

  // divide cell, that have only candidates and the number of its candidates are more than 2, into squares
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value === 0) {
        const { square } = rowCol2SquareNum(i, j);

        if (candidatesBySquare.has(square))
          candidatesBySquare
            .get(square)
            .push({ candidates: board[i][j].candidates, pos: [i, j] });
        else
          candidatesBySquare.set(square, [
            { candidates: board[i][j].candidates, pos: [i, j] },
          ]);
      }
    }
  }

  //get unique candidates set
  const has3UniqueCandidates = (...items) =>
    new Set(items.flatMap((item) => item.candidates)).size === 3;

  // implement the obvious triple technique
  candidatesBySquare.forEach((candidatesInSquare, squareNumber) => {
    let twoDigitCandidates = candidatesInSquare.filter(
      (item) => item.candidates.length === 2,
    );
    if (twoDigitCandidates.length >= 3) {
      const combinations = [];
      for (let i = 0; i < twoDigitCandidates.length - 2; i++) {
        for (let j = i + 1; j < twoDigitCandidates.length - 1; j++) {
          for (let k = j + 1; k < twoDigitCandidates.length; k++) {
            if (
              has3UniqueCandidates(
                twoDigitCandidates[i],
                twoDigitCandidates[j],
              ) &&
              has3UniqueCandidates(
                twoDigitCandidates[j],
                twoDigitCandidates[k],
              ) &&
              has3UniqueCandidates(
                twoDigitCandidates[k],
                twoDigitCandidates[i],
              ) &&
              has3UniqueCandidates(
                twoDigitCandidates[i],
                twoDigitCandidates[j],
                twoDigitCandidates[k],
              )
            )
              combinations.push([
                twoDigitCandidates[i],
                twoDigitCandidates[j],
                twoDigitCandidates[k],
              ]);
          }
        }
      }

      combinations.forEach((items) => {
        const effectNumbers = [
          ...new Set(items.flatMap((item) => item.candidates)),
        ];

        const effectCountsInSquare = candidatesInSquare
          .flatMap((item) => item.candidates)
          .filter((item) => effectNumbers.includes(item));
        if (effectCountsInSquare.length > 6) {
          // effect to the square
          answers.push({
            type: EffectType.SQUARE,
            index: squareNumber,
            values: effectNumbers,
            cells: items.map(({ pos }) => rowCol2SquareNum(pos[0], pos[1]).num),
          });
        }

        if (
          items[0].pos[0] === items[1].pos[0] &&
          items[1].pos[0] === items[2].pos[0]
        ) {
          // effect to the row
          const effectCountsInRow = empty0To8s()
            .flatMap((i) => board[items[0].pos[0]][i].candidates)
            .filter((item) => effectNumbers.includes(item));
          if (effectCountsInRow.length > 6) {
            answers.push({
              type: EffectType.ROW,
              index: items[0].pos[0],
              values: effectNumbers,
              cells: items.map(({ pos }) => pos[1]),
            });
          }
        } else if (
          items[0].pos[1] === items[1].pos[1] &&
          items[1].pos[1] === items[2].pos[1]
        ) {
          // effect to the col
          const effectCountsInCol = empty0To8s()
            .flatMap((i) => board[i][items[0].pos[1]].candidates)
            .filter((item) => effectNumbers.includes(item));
          if (effectCountsInCol.length > 6) {
            answers.push({
              type: EffectType.COL,
              index: items[0].pos[1],
              values: effectNumbers,
              cells: items.map(({ pos }) => pos[0]),
            });
          }
        }
      });
    }
  });

  log("findObviousTriples", answers);
  return answers;
};

// technique 7
// based on values, candidates of cells
export const findHiddenSingles = (board) => {
  const answers = [];

  const empty0To8 = empty0To8s();
  const findCandidateUsedOnce = (cells) => {
    const wrapedCells = cells.flatMap(({ candidates }) => candidates);
    const uniqueSet = new Set();
    const repeatedSet = new Set();

    const wlength = wrapedCells.length;
    for (let i = 0; i < wlength; i++) {
      const num = wrapedCells[i];
      if (uniqueSet.has(num)) {
        uniqueSet.delete(num);
        repeatedSet.add(num);
      } else if (!repeatedSet.has(num)) {
        uniqueSet.add(num);
      }
    }

    return Array.from(uniqueSet)
      .map((value) => {
        const cell_Idx = cells.findIndex(
          ({ candidates }) => candidates.indexOf(value) > -1,
        );
        // remove the obvious single case
        if (cells[cell_Idx].candidates.length > 1) {
          return { value, cell: cell_Idx };
        } else return null;
      })
      .filter((item) => Boolean(item));
  };

  for (let i = 0; i < 9; i++) {
    // find hidden single on the row
    const rowItems = empty0To8.map((j) => board[i][j]);
    const onceOnRow = findCandidateUsedOnce(rowItems);
    onceOnRow.forEach(({ value, cell }) => {
      answers.push({ type: EffectType.ROW, index: i, value, cell });
    });

    // find hidden single on the col
    const colItems = empty0To8.map((j) => board[j][i]);
    const onceOnCol = findCandidateUsedOnce(colItems);
    onceOnCol.forEach(({ value, cell }) => {
      answers.push({ type: EffectType.COL, index: i, value, cell });
    });

    // find hidden single on the square
    const squareItems = empty0To8.map((j) => {
      const { row, col } = squareNum2RowCol(i, j);
      return board[row][col];
    });
    const onceOnSquare = findCandidateUsedOnce(squareItems);
    onceOnSquare.forEach(({ value, cell }) => {
      answers.push({ type: EffectType.SQUARE, index: i, value, cell });
    });
  }

  log("findHiddenSingles", answers);
  return answers;
};

// technique 8
// based on values, candidates of cells
export const findHiddenPairs = (board) => {
  const answers = [];

  const empty0To8 = empty0To8s();

  const containedCell = (cells, candidate) =>
    cells
      .map(({ candidates }, idx) =>
        candidates.indexOf(candidate) > -1 ? idx : -1,
      )
      .filter((item) => item > -1)
      .sort();

  const findHiddenPairsOnSpace = (cells) => {
    const wrapedCells = cells.flatMap(({ candidates }) => candidates);
    const valueMap = new Map();

    const wlength = wrapedCells.length;
    for (let i = 0; i < wlength; i++) {
      const num = wrapedCells[i];
      if (valueMap.has(num)) {
        valueMap.set(num, valueMap.get(num) + 1);
      } else {
        valueMap.set(num, 1);
      }
    }

    const twiceUsed = [];
    valueMap.forEach((count, _key) => {
      if (count === 2) {
        twiceUsed.push({ value: _key, cells: containedCell(cells, _key) });
      }
    });

    const result = [];
    if (twiceUsed.length < 2) return [];
    else {
      // seek candidates
      for (let i = 0; i < twiceUsed.length - 1; i++) {
        for (let j = i + 1; j < twiceUsed.length; j++) {
          if (twiceUsed[i].cells.join() === twiceUsed[j].cells.join())
            if (
              cells[twiceUsed[i].cells[0]].candidates.length > 2 ||
              cells[twiceUsed[i].cells[1]].candidates.length > 2
            )
              // the others are up to obvious pairs case
              result.push({
                values: [twiceUsed[i].value, twiceUsed[j].value],
                cells: [...twiceUsed[i].cells],
              });
        }
      }
    }
    return result;
  };

  for (let i = 0; i < 9; i++) {
    // find hidden single on the row
    const rowItems = empty0To8.map((j) => board[i][j]);
    const onceOnRow = findHiddenPairsOnSpace(rowItems);
    onceOnRow.forEach(({ values, cells }) => {
      answers.push({ type: EffectType.ROW, index: i, values, cells });
    });

    // find hidden single on the col
    const colItems = empty0To8.map((j) => board[j][i]);
    const onceOnCol = findHiddenPairsOnSpace(colItems);
    onceOnCol.forEach(({ values, cells }) => {
      answers.push({ type: EffectType.COL, index: i, values, cells });
    });

    // find hidden single on the square
    const squareItems = empty0To8.map((j) => {
      const { row, col } = squareNum2RowCol(i, j);
      return board[row][col];
    });
    const pairOnSquare = findHiddenPairsOnSpace(squareItems);
    pairOnSquare.forEach(({ values, cells }) => {
      answers.push({ type: EffectType.SQUARE, index: i, values, cells });
    });
  }

  log("findHiddenPairs", answers);
  return answers;
};

// technique 9
// based on values, candidates of cells
export const findHiddenTriples = (board) => {
  const answers = [];

  const empty0To8 = empty0To8s();

  const containedCell = (cells, candidate) =>
    cells
      .map(({ candidates }, idx) =>
        candidates.indexOf(candidate) > -1 ? idx : -1,
      )
      .filter((item) => item > -1)
      .sort();

  const findHiddenTriplesOnSpace = (cells) => {
    const wrapedCells = cells.flatMap(({ candidates }) => candidates);
    const valueMap = new Map();

    const wlength = wrapedCells.length;
    for (let i = 0; i < wlength; i++) {
      const num = wrapedCells[i];
      if (valueMap.has(num)) {
        valueMap.set(num, valueMap.get(num) + 1);
      } else {
        valueMap.set(num, 1);
      }
    }

    const tripleUsed = [];
    valueMap.forEach((count, _key) => {
      if (count === 3) {
        tripleUsed.push({ value: _key, cells: containedCell(cells, _key) });
      }
    });

    const result = [];
    if (tripleUsed.length < 3) return [];
    else {
      // seek candidates
      for (let i = 0; i < tripleUsed.length - 1; i++) {
        for (let j = i + 1; j < tripleUsed.length; j++) {
          for (let k = j + 1; k < tripleUsed.length; k++) {
            if (
              tripleUsed[i].cells.join() === tripleUsed[j].cells.join() &&
              tripleUsed[j].cells.join() === tripleUsed[k].cells.join()
            )
              if (
                cells[tripleUsed[i].cells[0]].candidates.length > 3 ||
                cells[tripleUsed[i].cells[1]].candidates.length > 3 ||
                cells[tripleUsed[i].cells[2]].candidates.length > 3
              )
                // the others are up to obvious pairs case
                result.push({
                  values: [
                    tripleUsed[i].value,
                    tripleUsed[j].value,
                    tripleUsed[k].value,
                  ],
                  cells: [...tripleUsed[i].cells],
                });
          }
        }
      }
    }
    return result;
  };

  for (let i = 0; i < 9; i++) {
    // find hidden single on the row
    const rowItems = empty0To8.map((j) => board[i][j]);
    const onceOnRow = findHiddenTriplesOnSpace(rowItems);
    onceOnRow.forEach(({ values, cells }) => {
      answers.push({ type: EffectType.ROW, index: i, values, cells });
    });

    // find hidden single on the col
    const colItems = empty0To8.map((j) => board[j][i]);
    const onceOnCol = findHiddenTriplesOnSpace(colItems);
    onceOnCol.forEach(({ values, cells }) => {
      answers.push({ type: EffectType.COL, index: i, values, cells });
    });

    // find hidden single on the square
    const squareItems = empty0To8.map((j) => {
      const { row, col } = squareNum2RowCol(i, j);
      return board[row][col];
    });
    const tripleOnSquare = findHiddenTriplesOnSpace(squareItems);
    tripleOnSquare.forEach(({ values, cells }) => {
      answers.push({ type: EffectType.SQUARE, index: i, values, cells });
    });
  }
  log("findHiddenTriples", answers);
  return answers;
};

// technique 10
// based on candidates of cells
export const findPointingPairs = (board) => {
  const answers = [];

  const empty0To8 = empty0To8s();

  const containedCell = (cells, candidate) =>
    cells
      .map(({ candidates }, idx) =>
        candidates.indexOf(candidate) > -1 ? idx : -1,
      )
      .filter((item) => item > -1)
      .sort();

  const findPointingPairsInSquare = (cells) => {
    const wrapedCells = cells.flatMap(({ candidates }) => candidates);
    const valueMap = new Map();

    const wlength = wrapedCells.length;
    for (let i = 0; i < wlength; i++) {
      const num = wrapedCells[i];
      if (valueMap.has(num)) {
        valueMap.set(num, valueMap.get(num) + 1);
      } else {
        valueMap.set(num, 1);
      }
    }

    const twiceUsed = [];
    valueMap.forEach((count, _key) => {
      if (count === 2) {
        twiceUsed.push({ value: _key, cells: containedCell(cells, _key) });
      }
    });

    const result = [];
    if (twiceUsed.length < 2) return [];
    else {
      // seek candidates
      for (let i = 0; i < twiceUsed.length - 1; i++) {
        if (twiceUsed[i].cells[0] % 3 === twiceUsed[i].cells[1] % 3) {
          result.push({ type: EffectType.COL, ...twiceUsed[i] });
        } else if (
          Math.floor(twiceUsed[i].cells[0] / 3) ===
          Math.floor(twiceUsed[i].cells[1] / 3)
        ) {
          result.push({ type: EffectType.ROW, ...twiceUsed[i] });
        }
      }
    }
    return result;
  };

  for (let i = 0; i < 9; i++) {
    // find hidden single on the square
    const squareItems = empty0To8.map((j) => {
      const { row, col } = squareNum2RowCol(i, j);
      return board[row][col];
    });
    const onceOnSquare = findPointingPairsInSquare(squareItems);
    onceOnSquare.forEach(({ type, value, cells }) => {
      if (type === EffectType.ROW) {
        const { row, col } = squareNum2RowCol(i, cells[0]);
        const { col: col2 } = squareNum2RowCol(i, cells[1]);

        const rowItems = empty0To8.map((j) => board[row][j]);
        const countOfCandidates = rowItems
          .flatMap(({ candidates }) => candidates)
          .filter((item) => item === value).length;
        if (countOfCandidates > 2)
          answers.push({
            type,
            index: row,
            values: [value],
            cells: [col, col2],
          });
      } else if (type === EffectType.COL) {
        const { row, col } = squareNum2RowCol(i, cells[0]);
        const { row: row2 } = squareNum2RowCol(i, cells[1]);

        const colItems = empty0To8.map((j) => board[j][col]);
        const countOfCandidates = colItems
          .flatMap(({ candidates }) => candidates)
          .filter((item) => item === value).length;
        if (countOfCandidates > 2)
          answers.push({
            type,
            index: col,
            values: [value],
            cells: [row, row2],
          });
      }
    });
  }

  log("findPointingPairs", answers);
  return answers;
};

// technique 11
// based on candidates of cells
export const findPointingTriples = (board) => {
  const answers = [];

  const empty0To8 = empty0To8s();

  const containedCell = (cells, candidate) =>
    cells
      .map(({ candidates }, idx) =>
        candidates.indexOf(candidate) > -1 ? idx : -1,
      )
      .filter((item) => item > -1)
      .sort();

  const findPointingTriplesInSquare = (cells) => {
    const wrapedCells = cells.flatMap(({ candidates }) => candidates);
    const valueMap = new Map();

    const wlength = wrapedCells.length;
    for (let i = 0; i < wlength; i++) {
      const num = wrapedCells[i];
      if (valueMap.has(num)) {
        valueMap.set(num, valueMap.get(num) + 1);
      } else {
        valueMap.set(num, 1);
      }
    }

    const tripleUsed = [];
    valueMap.forEach((count, _key) => {
      if (count === 3) {
        tripleUsed.push({ value: _key, cells: containedCell(cells, _key) });
      }
    });

    const result = [];
    if (tripleUsed.length < 3) return [];
    else {
      // seek candidates
      for (let i = 0; i < tripleUsed.length - 1; i++) {
        if (
          tripleUsed[i].cells[0] % 3 === tripleUsed[i].cells[1] % 3 &&
          tripleUsed[i].cells[1] % 3 === tripleUsed[i].cells[2] % 3
        ) {
          result.push({ type: EffectType.COL, ...tripleUsed[i] });
        } else if (
          Math.floor(tripleUsed[i].cells[0] / 3) ===
            Math.floor(tripleUsed[i].cells[1] / 3) &&
          Math.floor(tripleUsed[i].cells[1] / 3) ===
            Math.floor(tripleUsed[i].cells[2] / 3)
        ) {
          result.push({ type: EffectType.ROW, ...tripleUsed[i] });
        }
      }
    }
    return result;
  };

  for (let i = 0; i < 9; i++) {
    // find hidden single on the square
    const squareItems = empty0To8.map((j) => {
      const { row, col } = squareNum2RowCol(i, j);
      return board[row][col];
    });
    const onceOnSquare = findPointingTriplesInSquare(squareItems);
    onceOnSquare.forEach(({ type, value, cells }) => {
      if (type === EffectType.ROW) {
        const { row, col } = squareNum2RowCol(i, cells[0]);
        const { col: col2 } = squareNum2RowCol(i, cells[1]);
        const { col: col3 } = squareNum2RowCol(i, cells[2]);

        const rowItems = empty0To8.map((j) => board[row][j]);
        const countOfCandidates = rowItems
          .flatMap(({ candidates }) => candidates)
          .filter((item) => item === value).length;
        if (countOfCandidates > 3)
          answers.push({
            type,
            index: row,
            values: [value],
            cells: [col, col2, col3],
          });
      } else if (type === EffectType.COL) {
        const { row, col } = squareNum2RowCol(i, cells[0]);
        const { row: row2 } = squareNum2RowCol(i, cells[1]);
        const { row: row3 } = squareNum2RowCol(i, cells[2]);

        const colItems = empty0To8.map((j) => board[j][col]);
        const countOfCandidates = colItems
          .flatMap(({ candidates }) => candidates)
          .filter((item) => item === value).length;
        if (countOfCandidates > 3)
          answers.push({
            type,
            index: col,
            values: [value],
            cells: [row, row2, row3],
          });
      }
    });
  }

  log("findPointingTriples", answers);
  return answers;
};

// technique 12
// based on values, candidates of cells
export const findYWing = (board) => {
  const answers = [];

  const cellsWithOnly2Candidates = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value === 0 && board[i][j].candidates.length === 2) {
        cellsWithOnly2Candidates.push({
          row: i,
          col: j,
          candidates: board[i][j].candidates,
        });
      }
    }
  }

  if (cellsWithOnly2Candidates.length >= 3) {
    for (let i = 0; i < cellsWithOnly2Candidates.length - 2; i++) {
      const a = cellsWithOnly2Candidates[i];
      for (let j = i + 1; j < cellsWithOnly2Candidates.length - 1; j++) {
        const b = cellsWithOnly2Candidates[j];
        for (let k = j + 1; k < cellsWithOnly2Candidates.length; k++) {
          const c = cellsWithOnly2Candidates[k];

          let wing = null;
          if (a.row === b.row && a.col === c.col) {
            wing = [c, a, b];
          } else if (a.row === b.row && b.col === c.col) {
            wing = [c, b, a];
          } else if (b.row === c.row && b.col === a.col) {
            wing = [a, b, c];
          } else if (b.row === c.row && c.col === a.col) {
            wing = [a, c, b];
          } else if (a.row === c.row && a.col === b.col) {
            wing = [b, a, c];
          } else if (a.row === c.row && c.col === b.col) {
            wing = [b, c, a];
          }

          if (wing !== null) {
            for (let m = 0; m < 4; m++) {
              const candidate1 = wing[0].candidates[Math.floor(m / 2)];
              const candidate2 = wing[2].candidates[m % 2];

              const isCandidateDifferent = candidate1 !== candidate2;
              const isCandidate1InPivot1 =
                wing[1].candidates.includes(candidate1);
              const isCandidate2InPivot1 =
                wing[1].candidates.includes(candidate2);
              const eliminatableNumber =
                wing[0].candidates[Math.floor(m / 2) > 0 ? 0 : 1] ===
                wing[2].candidates[m % 2 > 0 ? 0 : 1];
              const isEliminatableNumberInCell = board[wing[0].row][
                wing[2].col
              ].candidates.includes(wing[2].candidates[m % 2 > 0 ? 0 : 1]);

              if (
                isCandidateDifferent &&
                isCandidate1InPivot1 &&
                isCandidate2InPivot1 &&
                eliminatableNumber &&
                isEliminatableNumberInCell
              ) {
                answers.push({
                  cell: [wing[0].row, wing[2].col],
                  value: wing[2].candidates[m % 2 > 0 ? 0 : 1],
                  wing: [
                    {
                      cell: [wing[0].row, wing[1].col],
                      linkValue: [candidate1],
                    },
                    {
                      cell: [wing[1].row, wing[1].col],
                      linkValue: [candidate1, candidate2],
                    },
                    {
                      cell: [wing[1].row, wing[2].col],
                      linkValue: [candidate2],
                    },
                  ],
                });
              }
            }
          }
        }
      }
    }
  }
  log("findYWing", answers);
  return answers;
};

// technique 13
// based on values, candidates of cells
export const findXWing = (board) => {
  const answers = [];

  const findXWingForValue = (cells) => {
    const results = [];
    const uniqueRows = new Map();
    const uniqueCols = new Map();

    // Step 1: Collect unique rows and columns
    for (const [row, col] of cells) {
      if (!uniqueRows.has(row)) {
        uniqueRows.set(row, new Set());
      }
      uniqueRows.get(row).add(col);

      if (!uniqueCols.has(col)) {
        uniqueCols.set(col, new Set());
      }
      uniqueCols.get(col).add(row);
    }

    // Step 2-1: Find X-wing pattern on row
    const possibleRows = Array.from(uniqueRows.entries()).filter(
      ([_, cols]) => cols.size === 2,
    );
    if (possibleRows.length >= 2)
      for (let i = 0; i < possibleRows.length - 1; i++) {
        const [row, cols] = possibleRows[i];
        for (let j = i + 1; j < possibleRows.length; j++) {
          const [row2, cols2] = possibleRows[j];
          // check the rectangle and points located on other blocks
          if (
            new Set([...cols, ...cols2]).size === 2 &&
            Math.floor(row / 3) !== Math.floor(row2 / 3) &&
            Math.floor(cols[0] / 3) !== Math.floor(cols[1] / 3)
          ) {
            const eliminatableCells = cells.filter(
              (item) =>
                cols.has(item[1]) && item[0] !== row && item[0] !== row2,
            );
            if (eliminatableCells.length > 0) {
              const colsArray = Array.from(cols);
              results.push({
                type: EffectType.ROW,
                wing: [
                  [row, colsArray[0]],
                  [row, colsArray[1]],
                  [row2, colsArray[0]],
                  [row2, colsArray[1]],
                ],
                cells: eliminatableCells,
                rows: [row, row2],
                cols: colsArray,
              });
            }
          }
        }
      }

    // Step 2-2: Find X-wing pattern on col
    const possibleCols = Array.from(uniqueCols.entries()).filter(
      ([_, rows]) => rows.size === 2,
    );
    if (possibleCols.length >= 2)
      for (let i = 0; i < possibleCols.length - 1; i++) {
        const [col, rows] = possibleCols[i];
        for (let j = i + 1; j < possibleCols.length; j++) {
          const [col2, rows2] = possibleCols[j];
          // check the rectangle and points located on other blocks
          if (
            new Set([...rows, ...rows2]).size === 2 &&
            Math.floor(col / 3) !== Math.floor(col2 / 3) &&
            Math.floor(rows[0] / 3) !== Math.floor(rows[1] / 3)
          ) {
            const eliminatableCells = cells.filter(
              (item) =>
                rows.has(item[0]) && item[1] !== col && item[1] !== col2,
            );
            if (eliminatableCells.length > 0) {
              const rowsArray = Array.from(rows);
              results.push({
                type: EffectType.COL,
                wing: [
                  [rowsArray[0], col],
                  [rowsArray[0], col2],
                  [rowsArray[1], col],
                  [rowsArray[1], col2],
                ],
                cells: eliminatableCells,
                rows: rowsArray,
                cols: [col, col2],
              });
            }
          }
        }
      }
    return results;
  };

  // loop the candidate numbers
  for (let k = 1; k <= 9; k++) {
    const xWingCandidates = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j].value === 0 && board[i][j].candidates.includes(k)) {
          xWingCandidates.push([i, j]);
        }
      }
    }

    // 4 for xwing and at least one for eliminatable
    if (xWingCandidates.length >= 5) {
      const results = findXWingForValue(xWingCandidates);
      results.forEach(({ type, wing, cells, rows, cols }) =>
        answers.push({ type, wing, cells, rows, cols, value: k }),
      );
    }
  }

  log("findXWing", answers);
  return answers;
};

// technique 14
// based on values, candidates of cells
export const findSwordfish = (board) => {
  const answers = [];

  const findSwordForFish = (cells) => {
    const results = [];
    const uniqueRows = new Map();
    const uniqueCols = new Map();

    // Step 1: Collect unique rows and columns
    for (const [row, col] of cells) {
      if (!uniqueRows.has(row)) {
        uniqueRows.set(row, new Set());
      }
      uniqueRows.get(row).add(col);

      if (!uniqueCols.has(col)) {
        uniqueCols.set(col, new Set());
      }
      uniqueCols.get(col).add(row);
    }

    // Step 2-1: Find Sword Fish pattern on row
    const possibleRows = Array.from(uniqueRows.entries()).filter(
      ([_, cols]) => cols.size === 2,
    );
    if (possibleRows.length >= 3)
      for (let i = 0; i < possibleRows.length - 2; i++) {
        const [row, cols] = possibleRows[i];
        for (let j = i + 1; j < possibleRows.length - 1; j++) {
          const [row2, cols2] = possibleRows[j];
          for (let k = j + 1; k < possibleRows.length; k++) {
            const [row3, cols3] = possibleRows[k];
            // check the rectangle and points located on other blocks
            const commonCols = new Set([...cols, ...cols2, ...cols3]);
            if (
              commonCols.size === 3 &&
              new Set([...cols, ...cols2]).size === 3 &&
              new Set([...cols2, ...cols3]).size === 3 &&
              new Set([...cols3, ...cols]).size === 3 &&
              Math.floor(row / 3) !== Math.floor(row2 / 3) &&
              Math.floor(row2 / 3) !== Math.floor(row3 / 3) &&
              Math.floor(row3 / 3) !== Math.floor(row / 3) &&
              Math.floor(cols[0] / 3) !== Math.floor(cols[1] / 3) &&
              Math.floor(cols2[0] / 3) !== Math.floor(cols2[1] / 3) &&
              Math.floor(cols3[0] / 3) !== Math.floor(cols3[1] / 3)
            ) {
              const eliminatableCells = cells.filter(
                (item) =>
                  commonCols.has(item[1]) &&
                  item[0] !== row &&
                  item[0] !== row2 &&
                  item[0] !== row3,
              );
              if (eliminatableCells.length > 0)
                results.push({
                  type: EffectType.ROW,
                  wing: [
                    [row, Array.from(cols)[0]],
                    [row, Array.from(cols)[1]],
                    [row2, Array.from(cols2)[0]],
                    [row2, Array.from(cols2)[1]],
                    [row3, Array.from(cols3)[0]],
                    [row3, Array.from(cols3)[1]],
                  ],
                  cells: eliminatableCells,
                  rows: [row, row2, row3],
                  cols: Array.from(commonCols),
                });
            }
          }
        }
      }

    // Step 2-2: Find Sword Fish pattern on col
    const possibleCols = Array.from(uniqueCols.entries()).filter(
      ([_, rows]) => rows.size === 2,
    );
    if (possibleCols.length >= 3)
      for (let i = 0; i < possibleCols.length - 2; i++) {
        const [col, rows] = possibleCols[i];
        for (let j = i + 1; j < possibleCols.length - 1; j++) {
          const [col2, rows2] = possibleCols[j];
          for (let k = j + 1; k < possibleCols.length; k++) {
            const [col3, rows3] = possibleCols[k];
            // check the rectangle and points located on other blocks
            const commonRows = new Set([...rows, ...rows2, ...rows3]);
            if (
              commonRows.size === 3 &&
              new Set([...rows, ...rows2]).size === 3 &&
              new Set([...rows2, ...rows3]).size === 3 &&
              new Set([...rows3, ...rows]).size === 3 &&
              Math.floor(col / 3) !== Math.floor(col2 / 3) &&
              Math.floor(col2 / 3) !== Math.floor(col3 / 3) &&
              Math.floor(col3 / 3) !== Math.floor(col / 3) &&
              Math.floor(rows[0] / 3) !== Math.floor(rows[1] / 3) &&
              Math.floor(rows2[0] / 3) !== Math.floor(rows2[1] / 3) &&
              Math.floor(rows3[0] / 3) !== Math.floor(rows3[1] / 3)
            ) {
              const eliminatableCells = cells.filter(
                (item) =>
                  commonRows.has(item[0]) &&
                  item[1] !== col &&
                  item[1] !== col2 &&
                  item[1] !== col3,
              );
              if (eliminatableCells.length > 0)
                results.push({
                  type: EffectType.COL,
                  wing: [
                    [Array.from(rows)[0], col],
                    [Array.from(rows)[1], col],
                    [Array.from(rows2)[0], col2],
                    [Array.from(rows2)[1], col2],
                    [Array.from(rows3)[0], col3],
                    [Array.from(rows3)[1], col3],
                  ],
                  cells: eliminatableCells,
                  rows: Array.from(commonRows),
                  cols: [col, col2, col3],
                });
            }
          }
        }
      }
    return results;
  };

  // loop the candidate numbers
  for (let fishNumber = 1; fishNumber <= 9; fishNumber++) {
    const xWingCandidates = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (
          board[i][j].value === 0 &&
          board[i][j].candidates.includes(fishNumber)
        ) {
          xWingCandidates.push([i, j]);
        }
      }
    }

    // 4 for xwing and at least one for eliminatable
    if (xWingCandidates.length >= 7) {
      const results = findSwordForFish(xWingCandidates);
      results.forEach(({ type, wing, cells, rows, cols }) =>
        answers.push({ type, wing, cells, rows, cols, value: fishNumber }),
      );
    }
  }

  log("findSwordfish", answers);
  return answers;
};
