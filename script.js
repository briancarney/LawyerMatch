const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const progressBar = document.querySelector('.progress');
const timerInput = document.getElementById('timer-length');
const startGameButton = document.getElementById('start-game');
const scoreElement = document.getElementById('score');

let images = [];
let selectedImages = [];
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let matches = 0;
let timeLeft;
let timer;
let score = 0;
let hoverTimer;
let gameEnded = false;

// Fetch images from CSV
fetch('famous_lawyers_matching.csv')
    .then(response => response.text())
    .then(data => {
        const csvData = data.split('\n').map(row => row.split(',')[0]);
        images = csvData.filter(image => image.trim() !== '');
        console.log(images); // Log to verify the images array
    })
    .catch(error => console.error('Error loading CSV:', error));

startGameButton.addEventListener('click', initGame);

function initGame() {
    // Reset variables
    timeLeft = parseInt(timerInput.value);
    matches = 0;
    score = 0;
    gameEnded = false;
    updateScore();
    messageElement.textContent = '';

    // Select images and create game board
    selectedImages = getRandomImages(images, 10);
    const gameImages = shuffle([...selectedImages, ...selectedImages]);
    createGameBoard(gameImages);

    // Reset timer and start the game
    clearInterval(timer);
    startTimer();
}

function getRandomImages(array, num) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createGameBoard(images) {
    gameBoard.innerHTML = '';
    images.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="assets/${image}" alt="${image}" onerror="this.src='assets/placeholder.png'">
                    <div class="card-name">${image.split('.')[0].replace(/_/g, ' ')}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', flipCard);
        card.addEventListener('mouseover', handleMouseOver);
        card.addEventListener('mouseout', handleMouseOut);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || gameEnded) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.image === secondCard.dataset.image;

    if (isMatch) {
        disableCards();
        matches++;
        score += 10;  // Increment score by 10 for each match
        updateScore();
        if (matches === 10) endGame(true);
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function startTimer() {
    timerElement.textContent = `Time left: ${timeLeft}s`;
    progressBar.style.width = '100%';
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time left: ${timeLeft}s`;
        progressBar.style.width = `${(timeLeft / parseInt(timerInput.value)) * 100}%`;

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(win) {
    clearInterval(timer);
    gameEnded = true;
    messageElement.textContent = win ? `Congratulations You Win! Final Score: ${score}` : `Time's Up! You Lose! Final Score: ${score}`;
    lockBoard = true;
}

function resetGame() {
    matches = 0;
    score = 0;
    updateScore();
    messageElement.textContent = '';
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function handleMouseOver(event) {
    const card = event.currentTarget;
    if (card.classList.contains('flipped')) {
        hoverTimer = setTimeout(() => {
            card.querySelector('.card-name').style.visibility = 'visible';
        }, 2000); // 2 seconds
    }
}

function handleMouseOut(event) {
    const card = event.currentTarget;
    clearTimeout(hoverTimer);
    card.querySelector('.card-name').style.visibility = 'hidden';
}
