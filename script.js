const grid = document.getElementById("grid");
const guessInput = document.getElementById("guess-input");
const submitButton = document.getElementById("submit-button");
const message = document.getElementById("message");

let wordList = [];
let usedWords = JSON.parse(localStorage.getItem("usedWords")) || [];
let answer = "";
let currentRow = 0;
const maxAttempts = 6;

let usedLetters = [];
let excludedLetters = [];

// Fetch the word list
fetch("https://gist.githubusercontent.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b/raw/45c977427419a1e0edee8fd395af1e0a4966273b/wordle-answers-alphabetical.txt")
  .then(response => response.text())
  .then(data => {
    wordList = data.split("\n").map(word => word.trim());
    startGame();
  });

// Fetch valid words
fetch("https://gist.githubusercontent.com/dracos/dd0668f281e685bad51479e5acaadb93/raw/6bfa15d263d6d5b63840a8e5b64e04b382fdb079/valid-wordle-words.txt")
  .then(response => response.text())
  .then(data => {
    validWords = data.split("\n").map(word => word.trim());
  });

// Initialize the game
function startGame() {
  const filteredWordList = wordList.filter(word => !usedWords.includes(word));
  if (filteredWordList.length === 0) {
    showMessage("All words have been used!");
    return;
  }
  answer = filteredWordList[Math.floor(Math.random() * filteredWordList.length)].toLowerCase();
  createGrid();
}

// Create the game grid
function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < maxAttempts * 5; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);
  }
}

// Handle submit button click
submitButton.addEventListener("click", handleSubmit);

// Handle Enter key press
guessInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    handleSubmit();  // Trigger the same function when Enter is pressed
  }
});

// Function to handle guess submission
function handleSubmit() {
  const guess = guessInput.value.toLowerCase();
  
  // Check for valid word length and existence in word lists
  if (guess.length !== 5) {
    showMessage("Enter a 5-letter word.");
    return;
  }
  
  if (!validWords.includes(guess) && !wordList.includes(guess)) {
    showMessage("Not a valid word.");
    return;
  }

  // Call your checkGuess function with the valid guess
  checkGuess(guess);
  guessInput.value = "";  // Clear input after submission
}

// Display a message
function showMessage(msg) {
  message.textContent = msg;
  setTimeout(() => (message.textContent = ""), 2000);
}

// Check the guess
function checkGuess(guess) {
  const startIdx = currentRow * 5;
  const cells = Array.from(grid.children).slice(startIdx, startIdx + 5);

  let remainingAnswer = answer.split("");

  // First pass: check for correct positions
  guess.split("").forEach((letter, i) => {
    if (letter === answer[i]) {
      cells[i].textContent = letter;
      cells[i].classList.add("green");
      remainingAnswer[i] = null; // Mark this letter as matched
    }
  });

  // Second pass: check for correct letters in wrong positions
  guess.split("").forEach((letter, i) => {
    if (!cells[i].classList.contains("green") && remainingAnswer.includes(letter)) {
      cells[i].textContent = letter;
      cells[i].classList.add("yellow");
      remainingAnswer[remainingAnswer.indexOf(letter)] = null;
    } else if (!cells[i].classList.contains("green")) {
      cells[i].textContent = letter;
      cells[i].classList.add("gray");
    }
  });

  currentRow++;

  if (guess === answer) {
    showMessage("You win! The word was " + answer);
    guessInput.disabled = true;
    submitButton.disabled = true;
    usedWords.push(answer);
    localStorage.setItem("usedWords", JSON.stringify(usedWords));

  } else if (currentRow === maxAttempts) {
    showMessage("Game over! The word was " + answer);
    guessInput.disabled = true;
    submitButton.disabled = true;
    usedWords.push(answer);
    localStorage.setItem("usedWords", JSON.stringify(usedWords));
  }
}
