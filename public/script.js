let dino = document.getElementById('dino');
let scoreDisplay = document.getElementById('score');
let gameOverDisplay = document.getElementById('game-over');
let finalScoreDisplay = document.getElementById('final-score');
let startGameButton = document.getElementById('start-game');
let score = 0;
let isJumping = false;
let obstacles = [];
let obstacleIntervals = []; // Store all obstacle movement intervals
let obstacleCreationInterval; // For obstacle creation interval

function jump() {
    if (isJumping) return;
    isJumping = true;
    dino.classList.add('jump');

    setTimeout(() => {
        dino.classList.remove('jump');
        isJumping = false;
    }, 500);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.right = '-30px'; // Start off-screen from the right
    const height = Math.random() * 60 + 20; // Random height between 20 and 80
    obstacle.style.height = `${height}px`; // Set the height
    document.querySelector('.game-container').appendChild(obstacle);
    moveObstacle(obstacle);
}

function moveObstacle(obstacle) {
    let obstaclePassed = false; // Flag to track if the obstacle has been passed
    let height = parseInt(obstacle.style.height); // Get the height of the obstacle

    let obstacleMovementInterval = setInterval(() => {
        let rightPosition = parseInt(obstacle.style.right);

        // Check if the dinosaur has passed the obstacle
        if (!obstaclePassed && rightPosition >= window.innerWidth - 50) {
            obstaclePassed = true; // Mark that the obstacle has been passed
            
            // Award points based on height
            if (height < 50) { // Smaller obstacle
                score += 1;
            } else { // Larger obstacle
                score += 3;
            }
            scoreDisplay.textContent = `Score: ${score}`;
        }

        // Remove obstacle if it goes off-screen
        if (rightPosition >= window.innerWidth) {
            obstacle.remove();
            clearInterval(obstacleMovementInterval);
        } else {
            obstacle.style.right = `${rightPosition + 6}px`; // Increase the speed to 6 px
        }
        
        checkCollision(obstacle, obstacleMovementInterval);
    }, 20);

    // Store the interval to clear later
    obstacleIntervals.push(obstacleMovementInterval);
}

function checkCollision(obstacle, obstacleMovementInterval) {
    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
        dinoRect.x < obstacleRect.x + obstacleRect.width &&
        dinoRect.x + dinoRect.width > obstacleRect.x &&
        dinoRect.y < obstacleRect.y + obstacleRect.height &&
        dinoRect.y + dinoRect.height > obstacleRect.y
    ) {
        gameOver();
        clearInterval(obstacleMovementInterval); // Stop moving obstacle
    }
}

function gameOver() {
    gameOverDisplay.style.display = 'block';
    finalScoreDisplay.textContent = score;

    // Ask for player's name and save the score
    const playerName = prompt("Game Over! Enter your name:");
    if (playerName) {
        submitScore(playerName, score);
    }

    // Stop the game by clearing the obstacle creation interval
    clearInterval(obstacleCreationInterval);
    // Stop all ongoing obstacle movement intervals
    obstacleIntervals.forEach(interval => clearInterval(interval));
}

function submitScore(playerName, score) {
    // Send the player name and score to the server
    fetch('/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName: playerName, finalScore: score }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Score submitted successfully!');
            // Optionally, refresh or redirect the page
        } else {
            console.error('Failed to submit score.');
        }
    })
    .catch(error => {
        console.error('Error submitting score:', error);
    });
}

function startGame() {
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    gameOverDisplay.style.display = 'none';
    
    // Clear any remaining obstacles
    const existingObstacles = document.querySelectorAll('.obstacle');
    existingObstacles.forEach(obstacle => obstacle.remove());
    
    obstacles = []; // Reset obstacles array
    obstacleIntervals = []; // Clear the obstacle intervals array

    // Start creating obstacles
    obstacleCreationInterval = setInterval(createObstacle, 1500);
    startGameButton.style.display = 'none'; // Hide the start game button
}

function resetGame() {
    startGame();
}

// Start the game on load
startGameButton.style.display = 'block'; // Show the start game button on load
