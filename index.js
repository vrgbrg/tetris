let keypress = require('keypress');
let a = require('axel');
const shapes = require('./shapes');
let table = require('table');
let term = require('terminal-kit');
let pX = shapes.p1x;
let pY = shapes.p1y;
let currentValue = null;
let interval = 400
  , gameLoop
  , tick = 0;

const row = 20;
const cols = 10;
const vacant = 0;
let board = [];
for (let r = 0; r < row; r++) {
  board[r] = [];
  for (let c = 0; c < cols; c++) {
    board[r][c] = vacant;
  }
}

const renderGameSpace = (gameSpaceArray) => {
  for (let y = 0; y < gameSpaceArray.length - 1; y++) {
    for (let x = 0; x < gameSpaceArray[0].length; x++) {
      if (gameSpaceArray[y][x] !== 0) {
        currentValue = gameSpaceArray[y][x];
        // drawRectange(y, x, currentValue);
        // console.log(`A megjelenítendő kockák az x = ${x} \n az y = ${y}`);
        // console.log(board);
      }
    }
  }
};

// console.log(elements[0]);
// console.log(elements.i.contents[3]);

const endGame = () => {
  process.stdin.pause();
  clearInterval(gameLoop);
  a.cursor.on();
  a.cursor.restore();
};

const start = () => {
  a.cursor.off();
  a.clear();
  gameLoop = setInterval(eachLoop, interval);
};

const getRandomShape = () => {
  let randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  // let posShape = randomShape.value;
  randomShape.x = 0;
  randomShape.y = 0;
  return randomShape;
};

const key = () => {
  process.stdin.setRawMode(true);
  keypress(process.stdin);
  process.stdin.resume();
};

const eachLoop = () => {
  if (currentValue === null) {
    currentValue = getRandomShape();
  }
  // console.log(currentValue);
  tick += 1;
  // checkKeyDown();
  eraseElement();
  fall();
  showElement();
  if (clearLine()) {
    newRow();
  }
  if (freeze()) {
    fixElements();
    currentValue = null;
  }
  // colorElement();
  gameOver();
  let tableView = table.table(board);
  console.log(tableView);
};

start();
key();

const fixElements = () => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === 1) {
        board[i][j] = 2;
      }
    }
  }
};

const right = () => {
  if (currentValue.x < board[0].length) {
    currentValue.x++;
  }
};

const left = () => {
  if (currentValue.x < board[0].length) {
    currentValue.x--;
  }
};

const fall = () => {
  if (currentValue.y <= board.length - 1) {
    currentValue.y++;
  }
};

const rotate = () => {
  if (currentValue.direction < 4) {
    currentValue.direction++;
  } else {
    currentValue.direction = 0;
  }
};

const freeze = () => {
  for (let i = currentValue.y; i < currentValue.y + 4; i++) {
    for (let j = currentValue.x; j < currentValue.x + 4; j++) {
      if (board[i][j] === 1 && (i + 1 === board.length || board[i + 1][j] === 2)) {
        return true;
      }
    }
  }
  return false;
};

const gameOver = () => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[1][j] === 2) {
        console.log('Game over!');
        return true;
      }
    }
  }
  return false;
};

const clearLine = () => {

  for (let i = 0; i < board.length; i++) {
    let filled = 0;
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === 2) {
        filled++;
      }
    }
    if (filled === board[0].length) {
      console.log('clear');
      board.splice(i, 1);
      return true;
    }
  }
  return false;
};

const newRow = () => {
  board.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
};

const showElement = () => {
  for (let i = currentValue.y; i < currentValue.y + 4; i++) {
    for (let j = currentValue.x; j < currentValue.x + 4; j++) {
      if (currentValue.value[currentValue.direction][i - currentValue.y][j - currentValue.x] === 1) {
        board[i][j] = currentValue.value[currentValue.direction][i - currentValue.y][j - currentValue.x];
      }
    }
  }
  // console.log(currentValue);
};

const eraseElement = () => {
  for (let i = 0; i < board.length - 1; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === 1) {
        board[i][j] = 0;
      }
    }
  }
};

/*
const colorElement = () => {
  a.clear();
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === 1) {
        a.bg(0, 128, 255);
        a.box(j, i, 2, 1);
      } else if (board[i][j] === 2) {
        a.bg(0, 128, 255);
        a.box(j, i, 2, 1);
      }
    }
  }
  a.cursor.restore();
};
*/

let keyDown = null;

process.stdin.on('keypress', function (ch, key) {
  if (key) {
    if (key.name === 'escape') endGame();
    if (key.name === 'q') endGame();
    if (key.name === 'left') left();
    if (key.name === 'right') right();
    if (key.name === 'space') rotate();
  }

  if (key && key.ctrl && key.name === 'c') {
    endGame();
  }

});

let tableView = table.table(board);
console.log(tableView);
// showBoard();
renderGameSpace(board);
// console.log(currentValue);
// console.log(currentShape);
