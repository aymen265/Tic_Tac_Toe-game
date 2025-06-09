
const cells = document.querySelectorAll('.cell');
const resetbtn = document.querySelector('.reset');
const toggleModeBtn = document.querySelector('.toggle-mode'); 
const currrentTurn = document.querySelector('.current-turn');
const player1score = document.querySelector('.scores1');
const player2score = document.querySelector('.scores2');
const draw = document.querySelector('.draw');
const messageContent = document.querySelector('.content');
const overlay = document.getElementById('overlay');
const closebtn = document.getElementById('close');
const timerDisplay = document.getElementById('timer');

// All possible win 
const wincombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let computer = false;
let turn = true; 
let usedcells = []; 
let emptycells = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Tracks available cells
let winner = false; 
let ties = 0; 
let timerInterval; 
let seconds = 0; 


let player1 = {
  Symbol: '✕', // Player 1 symbol
  played: [],   
  score: 0      
};

let player2 = {
  Symbol: '◯', // Player 2 symbol
  played: [],   
  score: 0      
};

// Show whose turn it is at the start
checkTurn(turn);

// If playing against computer, let the robot play every 1 seconds if it's turn
setInterval(() => {
  if (computer) Airobot();
}, 1000);

// Add click event listeners to each cell
cells.forEach((cell, i) => {
  cell.addEventListener('click', () => {
    if (isemply(i) && !winner) { // Only allow if cell is empty and no winner yet
      if (turn === true) {
        addSymbol(player1, i); // Player 1 move
        turn = false;
        if (computer) emptycells.splice(emptycells.indexOf(i), 1); // Remove from empty if vs computer
        checkwin(player1);
      } else {
        addSymbol(player2, i); // Player 2 or computer move
        turn = true;
        if (computer) emptycells.splice(emptycells.indexOf(i), 1);
        checkwin(player2);
      }
      checkTurn(turn); // Update turn display
    } else {
      alert('Choose an empty cell');
    }
  });
});

// Add symbol to cell and update player state
function addSymbol(player, i) {
    cells[i].innerHTML = `<span>${player.Symbol}</span>`;
    cells[i].classList.add(player.Symbol === '✕' ? 'pink' : 'blue'); 
    player.played.push(i); 
    usedcells.push(i);     
    turn = !turn;          // Switch turn
}

// Check if a player has won or if it's a draw
function checkwin(player) {
  if (!winner) {
    wincombos.some(combo => {
      if (combo.every(i => player.played.includes(i))) {
        winner = true;
        player.score++;
        showscore();
        stopTimer(); // Stop the timer when the game ends
        setTimeout(showMessage, 500, player.Symbol, winner); // Show winner message
      }
    });
  }

  if (!winner && usedcells.length === 9) { // If all cells used and no winner, it's a draw
    ties++;
    showscore();
    stopTimer(); // Stop the timer when the game ends
    showMessage();
  }
}

// Check if a cell is empty
function isemply(i) {
  return !usedcells.includes(i);
}

// Reset the game board and state
function reset() {
    cells.forEach(cell => {
      cell.innerHTML = ''; // Clear the cell content
      cell.classList.remove('pink', 'blue'); // Remove the color classes
    });
    winner = false;
    usedcells = [];
    player1.played = [];
    player2.played = [];
    emptycells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    turn = true;
    seconds = 0; // Reset timer
    updateTimerDisplay(); // Reset timer display
    stopTimer(); // Stop any running timer
    startTimer(); // Start a new timer
    checkTurn(turn);
  }

// Reset button event
resetbtn.addEventListener('click', reset);

// Toggle between human and computer mode
toggleModeBtn.addEventListener('click', () => {
  computer = !computer; // Toggle the computer mode
  toggleModeBtn.textContent = computer ? '👥 Play vs Human' : '🤖 Play vs Robot'; // Update button text
  reset(); // Reset the game when switching modes
});

// Update the display to show whose turn it is
function checkTurn(turn) {
  if (usedcells.length < 9 && !winner) {
    currrentTurn.innerHTML = `<span>${turn ? player1.Symbol : player2.Symbol}</span>`;
  } else {
    currrentTurn.innerHTML = '';
  }
}

// Update the score display
function showscore() {
  player1score.innerHTML = player1.score;
  player2score.innerHTML = player2.score;
  draw.innerHTML = ties;
}

// Close message overlay and reset game
closebtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  reset();
});

// Show winner or draw message
function showMessage(player, winner) {
  overlay.style.display = 'flex';
  if (winner) {
    messageContent.innerHTML = `${player} is the <h2>winner</h2>`;
  } else {
    messageContent.innerHTML = 'It is a <h2>Draw</h2>';
  }
}

// AI logic for computer move using minimax
function Airobot() {
  if (computer && !winner && turn === false) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
      if (isemply(i)) {
        player2.played.push(i);
        usedcells.push(i);
        let score = minimax(player1.played.slice(), player2.played.slice(), usedcells.slice(), false);
        player2.played.pop();
        usedcells.pop();
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    if (move !== undefined) {
      addSymbol(player2, move);
      checkwin(player2);
      checkTurn(turn);
    }
  }
}

// Minimax algorithm for AI decision making
function minimax(p1, p2, used, isMaximizing) {
  if (checkWinStatic(p2)) return 1;
  if (checkWinStatic(p1)) return -1;
  if (used.length === 9) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!used.includes(i)) {
        p2.push(i);
        used.push(i);
        let score = minimax(p1, p2, used, false);
        p2.pop();
        used.pop();
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!used.includes(i)) {
        p1.push(i);
        used.push(i);
        let score = minimax(p1, p2, used, true);
        p1.pop();
        used.pop();
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Check if a set of moves is a win (used by minimax)
function checkWinStatic(moves) {
  return wincombos.some(combo => combo.every(idx => moves.includes(idx)));
}

// Timer Functions

// Start the timer
function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Update the timer display in mm:ss format
function updateTimerDisplay() {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Start the timer when the game begins
startTimer();