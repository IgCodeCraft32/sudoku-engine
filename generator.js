const { createNewGame } = require("./engine");
const { GameMode } = require("./enums");

const onlyValueArray = (board) =>
  board.flatMap((row) => row.map((cell) => cell.value));

var count = 1;
while (count > 0) {
  const formatedBoard = createNewGame(GameMode.CLASSIC, "Easy");
  console.log(formatedBoard, onlyValueArray(formatedBoard));
  count--;
}
