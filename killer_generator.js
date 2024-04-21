import fs from "fs";
import { generateKillerSudoku } from "killer-sudoku-generator";
const blanksArray = {
  easy: 50,
  medium: 55,
  hard: 70,
  expert: 81,
};
const levels = ["easy", "medium", "hard", "expert"];

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
levels.forEach((difficulty) =>
  ensureDirectoryExists(`./killer/${difficulty}`.toLowerCase())
);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generatePuzzle(solution, blanks) {
  const puzzle = solution.split("");
  const randomArray = shuffle(
    Array.from({ length: 81 }, (_, idx) => idx)
  ).slice(0, blanks);
  randomArray.forEach((idx) => {
    puzzle[idx] = 0;
  });
  return puzzle.join("");
}

levels.forEach((level) => {
  const blanks = blanksArray[level];
  const count = 3000;
  let remainCount = count;

  while (remainCount > 0) {
    try {
      const sudoku = generateKillerSudoku(level);

      const { solution, areas } = sudoku;
      const puzzle = generatePuzzle(solution, blanks);
      const filePath = `./killer/${level}/${remainCount}.json`.toLowerCase();
      fs.writeFileSync(
        filePath.toLowerCase(),
        JSON.stringify({
          puzzle,
          solution,
          cages: areas,
        })
      );

      console.error(level, remainCount);
      remainCount--;
    } catch (e) {
      console.error(level, remainCount, { e });
    }
  }
});
