import { createNewGame } from "./engine.mjs";
import { GameConfig, GameMode } from "./enums.mjs";
import fs from "fs";

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds));

const remains = ["Easy", "Medium", "Hard", "Expert", "Master", "Extreme"];
const count = 10000;
var remainingCount = count;
const sudokuMap = new Map();

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
remains.forEach((difficulty) =>
  ensureDirectoryExists(`./puzzles/${difficulty}`.toLowerCase())
);

await (async () => {
  while (remainingCount > 0) {
    const { difficulty, board } = await createNewGame(GameMode.CLASSIC);
    if (!sudokuMap.has(difficulty)) sudokuMap.set(difficulty, new Set([board]));
    else sudokuMap.get(difficulty).add(board);

    console.log("--", remainingCount, "--");
    await sleep(1);
    remainingCount--;
  }
})();

const boardStacks = [[], [], [], [], [], []];
sudokuMap.forEach((items, _key) => {
  try {
    const idx = GameConfig[GameMode.CLASSIC].horizon.findIndex(
      (item) => item >= _key
    );
    boardStacks[idx] = [...boardStacks[idx], ...items];
  } catch (e) {
    console.error({ e });
  }
});

boardStacks.forEach((items, idx) => {
  try {
    const difficulty = GameConfig[GameMode.CLASSIC].difficulty[idx];

    console.log(difficulty, items.length);
    items.forEach((board, idx) => {
      const filePath = `./puzzles/${difficulty}/${idx}`.toLowerCase();
      fs.writeFileSync(filePath.toLowerCase(), board);
    });
  } catch (e) {
    console.error({ e });
  }
});
