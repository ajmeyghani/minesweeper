;(function (g) { 'use strict';
  var root = g;

  function is(x) { return typeof x !== 'undefined'; }
  var game = function () { if (!(this instanceof game)) { return new game(); } };

  /* given the position of the element, it will
  return the nearby elements */
  game.prototype.nearby = function (arr, i, j) {
    var isElm = {
      onAbove: is(arr[i - 1]), onBelow: is(arr[i + 1]),
      onLeft: is(arr[i][j - 1]), onRight: is(arr[i][j + 1])
    };
    var nearby = {
      rows:       [ isElm.onRight ? arr[i][j + 1]   : undefined, isElm.onLeft ? arr[i][j - 1] : undefined],
      cols:       [ isElm.onAbove ? arr[i - 1][j] : undefined, isElm.onBelow ? arr[i + 1][j] : undefined],
      primDiag:   isElm.onAbove ? ([arr[i - 1][j - 1], arr[i - 1][j + 1]]) : [undefined],
      secondDiag: isElm.onBelow ? ([arr[i + 1][j - 1], arr[i + 1][j + 1]]) : [undefined]
    };
    var elms = [].concat(nearby.rows).concat(nearby.cols)
                 .concat(nearby.primDiag).concat(nearby.secondDiag)
                .filter(function (y) { return is(y); });
    return elms;
  };

  /* nearby mines given an element
      find the mines nearby element arr[i][j]
   */
  game.prototype.countNearbyMines = function (arr, i, j) {
    return this.nearby(arr, i, j)
               .filter(function (elm) { return elm === 1 })
               .length;
  };

  /* check if given element is mine */
  game.prototype.isMine = function (arr, i, j) { return arr[i][j] === 1; };

  /* get location of all mines */
  game.prototype.allMines = function (arr) {
    var positions = [];
    arr.forEach(function (row, ri) {
      row.forEach(function (col, ci) {
        if(arr[ri][ci]) { positions.push('' + ri + ',' + ci); }
      });
    });
    return positions;
  };

  if (typeof module !== 'undefined') {
    exports.game = game;
  } else {
    root.game = game;
  }

}(this));

var game = exports.game();
var slice = Array.prototype.slice;
require('./main.scss');
var shuffle = require('knuth-shuffle').knuthShuffle;

var board = { mines: 2, rows: 10, cols: 10, elms: []};
var gameNode = document.getElementById('js-game');

function overlay (state) {
  document.getElementById('js-overlay')
          .style.display = (state === 'show') ? 'block' : 'none';
}

function makeBoard () {
  board.elms.length = 0;
  var total = board.rows * board.cols;
  var isMines = board.mines;
  var tempBoard = [];

  while (total-- > 0) { tempBoard.push( isMines > 0 ? 1 : 0 ); isMines -= 1; }
  shuffle(tempBoard);
  while (tempBoard.length) { board.elms.push(tempBoard.splice(0, board.cols)); }

  var boardNode = document.createElement('div');
  boardNode.className = 'board'; boardNode.id = 'js-board';
  gameNode.appendChild(boardNode);

  var boxes = '';
  board.elms.forEach(function (row, ri) {
    row.forEach(function (col, ci) {
      boxes+='<button class="space" data-pos="'+ri+','+ci+'"></button>';
    });
  });
  boardNode.innerHTML = boxes;
}
function revealMines () {
  var mines = game.allMines(board.elms);
  var boxNodes = document.getElementById('js-board').childNodes;
  var boxes = Array.prototype.slice.call(boxNodes, 0);
  boxes.forEach(function (b) {
    mines.forEach(function (m) {
      if (b.getAttribute('data-pos') == m) {
        b.innerText = 'x';
      }
    });
  });
}
function play () {
  document.getElementById('js-board').addEventListener('click', function (e) {
    var clickedPos = e.target.getAttribute('data-pos').split(',')
             .map(function (elm) { return +elm});

    var x = clickedPos[0]; var y = clickedPos[1];

    var isMine = game.isMine(board.elms, x, y);
    if (isMine) {
      console.log('game over');
      revealMines();
      // overlay('show');
    } else {
      e.target.innerText = game.countNearbyMines(board.elms, x, y);
      e.target.style.border = 'none';
    }
  });
}

// start
makeBoard();
play();


// restart
document.getElementById('js-restart')
  .addEventListener('click', function () {
    gameNode.removeChild(document.getElementById('js-board'));
    makeBoard();
    play();
    // overlay('hide');
});

