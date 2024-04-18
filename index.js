import { createNewGame } from "./engine.mjs";
import { GameMode } from "./enums.mjs";
import fs from "fs";

const onlyValueString = (board) =>
  board.flatMap((row) => row.map((cell) => cell.value)).join("");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds));

const remains = ["Extreme"];
for (let i = 0; i < remains.length; i++) {
  const difficulty = remains[i];
  const count = 500;
  var remainingCount = count;
  const easySudoku = new Set();

  function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
  ensureDirectoryExists(`./puzzles/${difficulty}`.toLowerCase());

  await (async () => {
    while (remainingCount > 0) {
      const board = onlyValueString(
        await createNewGame(GameMode.CLASSIC, difficulty)
      );
      if (!easySudoku.has(board)) {
        easySudoku.add(board);

        const filePath = `./puzzles/${difficulty}/${
          count - remainingCount
        }`.toLowerCase();
        fs.writeFileSync(filePath.toLowerCase(), board);

        console.log("--", remainingCount, "--");
        await sleep(50); // Wait for 1 second before generating the next puzzle
        remainingCount--;
      }
    }
  })();
}
