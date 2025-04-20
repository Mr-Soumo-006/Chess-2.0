const board = document.getElementById('board');
const rows = 12;
const cols = 16;

let selectedSquare = null;
let currentTurn = 'w'; // 'w' for white, 'b' for black
let validMoves = [];

// Pieces with Unicode symbols (replace with images if desired)
const pieces = {
  'wP': '♙', 'wJ': '♘', 'wG': '♗', 'wH': '🦅', 'wS': '🦉', 'wW': '🔮', 'wR': '♖', 'wC': '♜', 'wL': '🦁', 'wT': '👸', 'wK': '♔',
  'bP': '♟', 'bJ': '♞', 'bG': '♝', 'bH': '🦅', 'bS': '🦉', 'bW': '🔮', 'bR': '♜', 'bC': '♖', 'bL': '🦁', 'bT': '👸', 'bK': '♚',
};

// Initial board setup with white pieces on bottom two rows
const initialBoardSetup = [
  ['bR','bJ','bG','bH','bS','bW','bL','bT','bK','bL','bW','bS','bH','bG','bJ','bR'], // 0 - Black major pieces
  ['bP','bP','bP','bP','bP','bP','bP','bP','bP','bP','bP','bP','bP','bP','bP','bP'], // 1 - Black pawns
  ['','','','','','','','','','','','','','','',''], // 2
  ['','','','','','','','','','','','','','','',''], // 3
  ['','','','','','','','','','','','','','','',''], // 4
  ['','','','','','','','','','','','','','','',''], // 5
  ['','','','','','','','','','','','','','','',''], // 6
  ['','','','','','','','','','','','','','','',''], // 7
  ['','','','','','','','','','','','','','','',''], // 8
  ['','','','','','','','','','','','','','','',''], // 9
  ['wP','wP','wP','wP','wP','wP','wP','wP','wP','wP','wP','wP','wP','wP','wP','wP'], // 10 - White pawns
  ['wR','wJ','wG','wH','wS','wW','wL','wT','wK','wL','wW','wS','wH','wG','wJ','wR'], // 11 - White major pieces
];

// Create board squares and place pieces
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const square = document.createElement('div');
    square.classList.add('square');
    if ((r + c) % 2 === 0) square.classList.add('light');
    else square.classList.add('dark');
    square.dataset.row = r;
    square.dataset.col = c;

    const pieceCode = initialBoardSetup[r][c];
    if (pieceCode && pieces[pieceCode]) {
      square.textContent = pieces[pieceCode];
      square.dataset.piece = pieceCode;
    }

    square.addEventListener('click', onSquareClick);
    board.appendChild(square);
  }
}

// Movement offsets for Wizard (one step in all 8 directions)
const wizardMoves = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1]
];

// Movement offsets for Knight (example for Jack)
const knightMoves = [
  [-2, -1], [-2, 1],
  [-1, -2], [-1, 2],
  [1, -2],  [1, 2],
  [2, -1],  [2, 1]
];

// Helper to get square div by row and col
function getSquare(row, col) {
  return board.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}

// Get valid moves for a piece at (row,col)
function getValidMoves(pieceCode, row, col) {
  const color = pieceCode[0];
  const type = pieceCode[1];
  let moves = [];

  if (type === 'W') { // Wizard: one step any direction
    for (const [dr, dc] of wizardMoves) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        moves.push([nr, nc]);
      }
    }
  } else if (type === 'P') { // Pawn: one step forward if empty + capture diagonals
    const dir = color === 'w' ? -1 : 1;
    const nr = row + dir;
    if (nr >= 0 && nr < rows) {
      const forwardSquare = getSquare(nr, col);
      if (forwardSquare && !forwardSquare.dataset.piece) {
        moves.push([nr, col]);
      }
      // Capture diagonals
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (nc >= 0 && nc < cols) {
          const diagSquare = getSquare(nr, nc);
          if (diagSquare && diagSquare.dataset.piece && !diagSquare.dataset.piece.startsWith(color)) {
            moves.push([nr, nc]);
          }
        }
      }
    }
  } else if (type === 'J') { // Jack (Knight-like)
    for (const [dr, dc] of knightMoves) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        moves.push([nr, nc]);
      }
    }
  } else {
    // TODO: Add movement rules for other mythical pieces here
  }

  // Filter moves to exclude squares occupied by own pieces
  moves = moves.filter(([r, c]) => {
    const sq = getSquare(r, c);
    return !sq.dataset.piece || !sq.dataset.piece.startsWith(color);
  });

  return moves;
}

function clearHighlights() {
  document.querySelectorAll('.square.highlight').forEach(sq => sq.classList.remove('highlight'));
}

function onSquareClick(e) {
  const square = e.currentTarget;
  const pieceCode = square.dataset.piece;
  const row = +square.dataset.row;
  const col = +square.dataset.col;

  if (!selectedSquare) {
    // Select only current player's piece
    if (pieceCode && pieceCode.startsWith(currentTurn)) {
      selectedSquare = square;
      square.classList.add('highlight');

      validMoves = getValidMoves(pieceCode, row, col);
      validMoves.forEach(([r, c]) => {
        const sq = getSquare(r, c);
        if (sq) sq.classList.add('highlight');
      });
    }
  } else {
    // If clicked on a valid move square, move piece
    if (validMoves.some(([r, c]) => r === row && c === col)) {
      // Move piece
      square.textContent = selectedSquare.textContent;
      square.dataset.piece = selectedSquare.dataset.piece;

      selectedSquare.textContent = '';
      delete selectedSquare.dataset.piece;

      clearHighlights();
      selectedSquare = null;
      validMoves = [];

      // Switch turn
      currentTurn = currentTurn === 'w' ? 'b' : 'w';
      updateStatus();
    } else {
      // Clicked invalid square or own piece, reset selection
      clearHighlights();
      selectedSquare = null;
      validMoves = [];
    }
  }
}

function updateStatus() {
  document.querySelector('h1').textContent = `Clash of Mythic Titans - ${currentTurn === 'w' ? 'White' : 'Black'} to move`;
}

updateStatus();
