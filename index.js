let keypress = require('keypress');
const shapes = require('./shapes');
let table = require('table');
const clear = require('console-clear');
const mpg = require('mpg123');
let currentValue = null;
let nextValue = null;
let interval = 600;
let gameLoop;
let tick = 0;
let score = 0;
let level = 1;

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

const playMusic = () => {
  var player = new mpg.MpgPlayer();
  player.play(`${__dirname}/tetris.mp3`);
};

playMusic();

const canvas = [[], [[], [], []]];

const showBoard = () => {
  const row = 20;
  const cols = 10;
  const vacant = 0;
  let showBoard = [];
  for (let r = 0; r < row; r++) {
    showBoard[r] = [];
    for (let c = 0; c < cols; c++) {
      showBoard[r][c] = vacant;
    }
  }
  for (let i = 0; i < showBoard.length; i++) {
    for (let j = 0; j < showBoard[0].length; j++) {
      showBoard[i][j] = board[i][j];
      if (showBoard[i][j] === 2) {
        showBoard[i][j] = '\x1b[40m\x1b[30m2\x1b[0m';
      } else if (showBoard[i][j] === 1) {
        showBoard[i][j] = currentValue.color;
      } else if (showBoard[i][j] === 0) {
        showBoard[i][j] = '\x1b[8m0\x1b[0m';
      }
    }
  }
  // console.log(currentValue);
  return showBoard;
};

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
};

const start = () => {
  gameLoop = setInterval(eachLoop, interval);
};

const getRandomShape = () => {
  let randomShape = shapes[Math.floor(Math.random() * shapes.length)];

  // let randomShape = shapes[3];
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
  clear();
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
  updateLevel();
  gameOver();
  console.log('Score: ', score);
  console.log('Level: ', level);
  let tableView = table.table(showBoard());
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
  if (currentValue && currentValue.x < board[0].length - 2) {
    currentValue.x++;
  }
};

const left = () => {
  if (currentValue && currentValue.x >= 0) {
    currentValue.x--;
  }
};

const down = () => {
  if (currentValue && currentValue.y < board.length) {
    currentValue.y++;
    interval = 300;
  }
};

const fall = () => {
  if (currentValue && currentValue.y < board.length) {
    currentValue.y++;
  }
};

const rotate = () => {
  if (currentValue.direction < 3) {
    currentValue.direction++;
  } else {
    currentValue.direction = 0;
  }
};

const freeze = () => {
  for (let i = currentValue.y; i < currentValue.y + currentValue.value[currentValue.direction].length; i++) {
    for (let j = currentValue.x; j < currentValue.x + currentValue.value[currentValue.direction][0].length; j++) {
      if (i < row && j < cols) {
        if (board[i][j] === 1) {
          if (i + 1 === board.length || board[i + 1][j] === 2) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const updateLevel = () => {
  if (score >= 1000) {
    level = 2;
    interval -= 50;
  } else if (score >= 2000) {
    level = 3;
    interval -= 100;
  } else if (score >= 3000) {
    level = 4;
    interval -= 100;
  } else if (score >= 4000) {
    level = 5;
    interval -= 100;
  } else if (score >= 5000) {
    level = 6;
    interval -= 100;
  } else if (score >= 6000) {
    level = 7;
    interval -= 100;
  }
};

const gameOver = () => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[1][j] === 2) {
        console.log('Game over!');
        endGame();
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
      score += 100;
      return true;
    }
  }
  return false;
};

const newRow = () => {
  board.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
};

const showElement = () => {
  if (!currentValue) {
    return;
  }
  for (let i = currentValue.y; i < currentValue.y + currentValue.value[currentValue.direction].length; i++) {
    for (let j = currentValue.x; j < currentValue.x + currentValue.value[currentValue.direction][0].length; j++) {
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

let keyDown = null;

process.stdin.on('keypress', function (ch, key) {
  if (key) {
    if (key.name === 'escape') endGame();
    if (key.name === 'q') endGame();
    if (key.name === 'left') left();
    if (key.name === 'down') down();
    if (key.name === 'right') right();
    if (key.name === 'space') rotate();
  }

  if (key && key.ctrl && key.name === 'c') {
    endGame();
  }

});

let tableView = table.table(showBoard());
console.log(tableView);
// showBoard();
renderGameSpace(board);
// console.log(currentValue);
// console.log(currentShape);
