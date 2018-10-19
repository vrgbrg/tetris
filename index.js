//Requires
let keypress = require('keypress')
  , c = require('axel')
  , width = c.cols
  , height = c.rows
  , p1x = c.cols / 2
  , p1y = 3
  , lp1x = p1x
  , lp1y = p1y
  , gameLoop
  , interval = 20
  , tick = 0
  , box = []
  ;

// var theBrush = '█';
let theBrush = ' ';

function shapeSquare(x, y) {
  c.clear();
  let square = {
    x: p1x,
    y: p1y
  };

  if (square) {
    c.brush = theBrush;
    c.bg(0, 255, 0);
    c.box(x, y, 2, 1);
    c.box(x, y + 1, 2, 1);
    c.box(x + 2, y, 2, 1);
    c.box(x + 2, y + 1, 2, 1);
  }

  for (let i = 0; i < box.length; i++) {
    c.box(box[i].x, box[i].y, 4, 2);
    //console.log(box);
  }
}

function eraseShapeSquare(x, y) {
  c.brush = ' ';
  c.cursor.reset();
  c.box(x - 2, y, 8, 2);
}

function eachLoop() {
  tick += 1;

  width = c.cols;
  height = c.rows;

  //checkKeyDown();

  eraseShapeSquare(lp1x, lp1y);
  shapeSquare(p1x, p1y);
  drop();
  freeze();
}

function endGame() {
  process.stdin.pause();
  clearInterval(gameLoop);
  c.cursor.on();
  c.cursor.restore();
}

function start() {
  c.cursor.off();
  c.clear();
  gameLoop = setInterval(eachLoop, interval);
}

function key() {
  process.stdin.setRawMode(true);
  keypress(process.stdin);
  process.stdin.resume();
}

start();
key();

function left() {
  lp1x = p1x;
  p1x -= p1x > 10 ? 2 : 0;
}

function right() {
  lp1x = p1x;
  p1x += p1x < width - 10 ? 2 : 0;
}

function drop() {
  lp1y = p1y;
  p1y += p1y < height - 1 ? 0.05 : 0;
}

function checkBox() {
  for (let i = 0; i < box.length; i++) {
    const xPosBoxes = box.find(elem => elem.x === p1x);
    if (xPosBoxes) {
      return getMinElement(box)-2;
    }
  }
  return height - 1;
}

function getMinElement(array) {
  let min = box[0].y;

  for (let i = 0; i < box.length; i++) {
    if (box[i].y < min) {
      min = box[i].y;
    }
  }
  return min;
}

function freeze() {
  if (p1y >= checkBox()) {
    let square = {
      x: p1x,
      y: p1y
    };
    box.push(square);
    p1x = c.cols / 2;
    p1y = 3;
  }
}

var keyDown = null;

process.stdin.on('keypress', function (ch, key) {

  if (key) {
    if (key.name === 'escape') endGame();
    if (key.name === 'q') endGame();
    if (key.name === 'left') left();
    if (key.name === 'right') right();
  }

  if (key && key.ctrl && key.name === 'c') {
    endGame();
  }

});

// p1x - boxnak van e olyan eleme ami megegyezik, ha van visszaadjuk a koordinátához tartozó y-t
// ha nincs vissza kell adni a magasság - 1
