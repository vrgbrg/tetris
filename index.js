let keypress = require('keypress');
const shapes = require('./shapes');
let table = require('table');
const clear = require('console-clear');
const mpg = require('mpg123');
let currentValue = null;
let nextValue = null;
let gameLoop;
let tick = 0;
let interval = 600;
let score = 0;
let level = 1;
// let player = new mpg.MpgPlayer();
const getTimestamp = () => Math.round(new Date().getTime() / 1000);
let lastKeyPress = getTimestamp();

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

/*
const playMusic = () => {
  player.play(`${__dirname}/tetris.mp3`);
};
*/

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
  return showBoard;
};

const sideBoard = () => {
  const sideRow = 1;
  const sideCols = 3;
  const vacant = 0;
  let sideBoard = [];
  for (let sr = 0; sr < sideRow; sr++) {
    sideBoard[sr] = [];
    for (let sc = 0; sc < sideCols; sc++) {
      sideBoard[sr][sc] = vacant;
    }
  }

  sideBoard[0][0] = 'Level: ' + level;
  sideBoard[0][1] = 'Score: ' + score;
  sideBoard[0][2] = 'Next: ';

  let sideView = table.table(sideBoard);
  console.log(sideView);
};

const renderGameSpace = (gameSpaceArray) => {
  for (let y = 0; y < gameSpaceArray.length - 1; y++) {
    for (let x = 0; x < gameSpaceArray[0].length; x++) {
      if (gameSpaceArray[y][x] !== 0) {
        currentValue = gameSpaceArray[y][x];
      }
    }
  }
};

const getRandomShape = () => {
  let randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  randomShape.x = 3;
  randomShape.y = 0;
  return randomShape;
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

const fixElements = () => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === 1) {
        board[i][j] = 2;
      }
    }
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
        console.log('\x1b[31m\x1b[7m\x1b[1m\x1b[5mGame over!\x1b[0m');
        endGame();
        return true;
      }
    }
  }
  return false;
};

const getMostRightColumn = (element) => {
  if (!element) {
    return board[0].length + 1;
  }
  for (let j = element.x + element.value[element.direction][0].length - 1; j >= element.x; j--) {
    for (let i = element.y; i < element.y + element.value[element.direction].length; i++) {
      if (currentValue.value[currentValue.direction][i - currentValue.y][j - currentValue.x] === 1) {
        return j;
      }
    }
  }
  return board[0].length + 1;
};

const getMostLeftColumn = (element) => {
  if (!element) {
    return -1;
  }
  for (let j = element.x; j < element.x + element.value[element.direction][0].length; j++) {
    for (let i = element.y; i < element.y + element.value[element.direction].length; i++) {
      if (currentValue.value[currentValue.direction][i - currentValue.y][j - currentValue.x] === 1) {
        return j;
      }
    }
  }
  return -1;
};

const right = () => {
  if (currentValue && getMostRightColumn(currentValue) < board[0].length - 1) {
    currentValue.x++;
  }
};

const left = () => {
  if (currentValue && getMostLeftColumn(currentValue) > 0) {
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

const start = () => {
  gameLoop = setInterval(eachLoop, interval);
};

const endGame = () => {
  process.stdin.pause();
  clearInterval(gameLoop);
};

const key = () => {
  process.stdin.setRawMode(true);
  keypress(process.stdin);
  process.stdin.resume();
};

let keyDown = null;

const eachLoop = () => {
  if (currentValue === null) {
    currentValue = getRandomShape();
  }
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
  updateLevel();
  gameOver();
  sideBoard();
  let tableView = table.table(showBoard());
  console.log(tableView);
};

start();
key();

process.stdin.on('keypress', function (ch, key) {
  if (key) {
    if (key.name === 'escape') endGame();
    if (key.name === 'q') endGame();
    if (key.name === 'left') left();
    if (key.name === 'right') right();
    if (key.name === 'space') rotate();
    if (key.name === 'down') down();
    // if (key.name === 's') player.close(`${__dirname}/tetris.mp3`);
    // if (key.name === 'm') playMusic();
  }

  if (key && key.ctrl && key.name === 'c') {
    endGame();
  }
});

let tableView = table.table(showBoard());
console.log(tableView);
renderGameSpace(board);
