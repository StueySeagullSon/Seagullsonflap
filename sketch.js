// Final Version: June 18, 2025
// Stuey's Seagull Son

// Game objects
let player;
let obstacles = [];
let powerups = [];

// Game state & score
let score = 0;
let highScore = 0;
let gameState = 'start';
let gameOverSoundPlayed = false; // Fixes the sound timing issue

// Assets
let seagullSprite, obstacleSprite, crabSprite, frySprite;
let bgMusic, jumpSound, squawkSound, pointSound;
let bgLayers = [];

function preload() {
  // Loads all sound files from the main project folder
  soundFormats('mp3');
  bgMusic = loadSound('background.mp3');
  jumpSound = loadSound('jump.mp3');
  pointSound = loadSound('point.mp3');
  squawkSound = loadSound('squawk.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  highScore = getItem('seagullHighScore') || 0;
  player = new Player();

  // Create pixel-art sprites
  seagullSprite = createGraphics(40, 30);
  drawSeagull(seagullSprite, 0);
  obstacleSprite = createGraphics(50, 100);
  drawObstacle(obstacleSprite);
  crabSprite = createGraphics(40, 30);
  drawCrab(crabSprite);
  frySprite = createGraphics(25, 35);
  drawFry(frySprite);

  // Create background layers for parallax effect
  bgLayers.push(new BackgroundLayer(0.2, height / 2, 5, 20, 200));
  bgLayers.push(new BackgroundLayer(0.5, height / 2 - 50, 10, 30, 150));
}

function draw() {
  background(135, 206, 250); // Sky blue
  for (let layer of bgLayers) {
    layer.update();
    layer.display();
  }

  // State machine for the game flow
  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'playing') {
    runGame();
  } else if (gameState === 'gameOver') {
    // This new logic ensures the sound plays correctly
    if (!gameOverSoundPlayed) {
      if (squawkSound.isLoaded()) {
        squawkSound.play();
      }
      bgMusic.stop();
      gameOverSoundPlayed = true;
    }
    drawGameOverScreen();
  }
}

function runGame() {
  player.update();
  player.display();

  // Handle obstacles
  if (frameCount % 90 === 0) {
    obstacles.push(new Obstacle());
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].display();
    if (obstacles[i].hits(player)) {
      endGame();
    }
    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  // Handle power-ups
  if (frameCount % 150 === 0) {
    powerups.push(new PowerUp());
  }
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].update();
    powerups[i].display();
    if (powerups[i].hits(player)) {
      score += 5;
      if (pointSound.isLoaded()) { pointSound.play(); }
      powerups.splice(i, 1);
    } else if (powerups[i].offscreen()) {
      powerups.splice(i, 1);
    }
  }

  drawScore();
}

// endGame is now simpler, it just changes the state
function endGame() {
  gameState = 'gameOver';
  if (score > highScore) {
    highScore = score;
    storeItem('seagullHighScore', highScore);
  }
}

// Handles all user input (touch and keyboard)
function handleInput() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  if (gameState === 'playing') {
    player.jump();
  } else {
    resetGame();
  }
}

function keyPressed() { if (key === ' ') { handleInput(); } }
function touchStarted() { handleInput(); return false; }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }

// Resets the game to its starting state
function resetGame() {
  if (bgMusic.isLoaded() && !bgMusic.isPlaying()) {
    bgMusic.loop();
  }
  obstacles = [];
  powerups = [];
  score = 0;
  gameOverSoundPlayed = false; // Reset the flag for the next game
  player = new Player();
  gameState = 'playing';
}

// --- Drawing Functions for Screens and UI ---

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(0); textSize(40);
  text("Stuey's Seagull Son", width / 2, height / 3);
  textSize(20);
  text("Tap screen to Start", width / 2, height / 2);
  textSize(16);
  text(`High Score: ${highScore}`, width / 2, height / 2 + 40);
}

function drawGameOverScreen() {
  textAlign(CENTER, CENTER);
  fill(255, 0, 0); textSize(50);
  text('GAME OVER', width / 2, height / 3);
  fill(0); textSize(24);
  text(`Score: ${score}`, width / 2, height / 2);
  textSize(20);
  text(`High Score: ${highScore}`, width / 2, height / 2 + 40);
  textSize(16);
  text('Tap screen to play again', width / 2, height / 2 + 80);
}

function drawScore() {
  textAlign(LEFT, TOP); fill(0); textSize(24);
  text(`Score: ${score}`, 20, 20);
  textAlign(RIGHT, TOP);
  text(`High Score: ${highScore}`, width - 20, 20);
}

// --- Functions to Draw Pixel Art ---

function drawSeagull(pg, frame) { pg.background(0,0,0,0); pg.noStroke(); pg.fill(220); pg.rect(10, 10, 20, 10); pg.rect(30, 5, 10, 10); pg.fill(255, 200, 0); pg.rect(40, 8, 5, 4); pg.fill(0); pg.rect(32, 7, 2, 2); pg.fill(200); if (floor(frame / 10) % 2 === 0) { pg.rect(5, 0, 15, 8); } else { pg.rect(5, 12, 15, 8); } }
function drawObstacle(pg) { pg.background(0,0,0,0); pg.fill(139, 69, 19); pg.rect(0, 0, 50, 100); pg.fill(105, 105, 105); pg.rect(0, 0, 50, 10); }
function drawCrab(pg) { pg.background(0,0,0,0); pg.noStroke(); pg.fill(255, 69, 0); pg.ellipse(20, 20, 30, 20); pg.fill(0); pg.ellipse(15, 15, 5, 5); pg.ellipse(25, 15, 5, 5); pg.rect(5, 10, 5, 10); pg.rect(30, 10, 5, 10); }
function drawFry(pg) { pg.background(0,0,0,0); pg.noStroke(); pg.fill(255, 223, 0); for (let i = 0; i < 5; i++) { pg.rect(i * 5, 5 + random(-5, 5), 4, 30); } }

// --- Game Object Classes ---

class Player {
  constructor() { this.x = width / 4; this.y = height / 2; this.gravity = 0.6; this.lift = -15; this.velocity = 0; this.size = 30; }
  jump() { this.velocity += this.lift; if (jumpSound.isLoaded()) { jumpSound.play(); } }
  update() { this.velocity += this.gravity; this.y += this.velocity; this.y = constrain(this.y, 0, height - this.size / 2); }
  display() { image(seagullSprite, this.x, this.y - this.size / 2); }
}

class Obstacle {
  constructor() {
    this.x = width; this.w = 60; this.speed = 5; this.type = random() > 0.4 ? 'chimney' : 'crab';
    if (this.type === 'chimney') { let gap = height / 3.5; this.top = random(50, height - 50 - gap); this.bottom = height - this.top - gap; } else { this.h = 30; this.w = 40; this.y = random() > 0.5 ? 0 : height - this.h; }
  }
  hits(player) {
    let p_x = player.x + player.size/2; let p_y = player.y; let p_r = player.size/2;
    if (this.type === 'chimney') { if (p_y - p_r < this.top || p_y + p_r > height - this.bottom) { if (p_x > this.x && p_x < this.x + this.w) { return true; } }
    } else { if (p_x > this.x && p_x < this.x + this.w) { if ( (this.y === 0 && p_y - p_r < this.y + this.h) || (this.y !== 0 && p_y + p_r > this.y) ) { return true; } } }
    return false;
  }
  update() { this.x -= this.speed; }
  display() {
    if (this.type === 'chimney') { image(obstacleSprite, this.x, 0, this.w, this.top); image(obstacleSprite, this.x, height - this.bottom, this.w, this.bottom); } else { image(crabSprite, this.x, this.y, this.w, this.h); }
  }
  offscreen() { return this.x < -this.w; }
}

class PowerUp {
  constructor() { this.x = width; this.w = 25; this.h = 35; this.speed = 5; this.y = random(height * 0.2, height * 0.8); }
  hits(player) { return collideRectRect(player.x, player.y - player.size/2, player.size, player.size, this.x, this.y, this.w, this.h); }
  update() { this.x -= this.speed; }
  display() { image(frySprite, this.x, this.y, this.w, this.h); }
  offscreen() { return this.x < -this.w; }
}

class BackgroundLayer { constructor(speed, y, size, alpha, col) { this.speed = speed; this.y = y; this.elements = []; for (let i = 0; i < 10; i++) { this.elements.push({x: random(width*2), y: this.y + random(-40, 40), size: random(size*0.8, size*1.2), color: color(col, alpha)}); } } update() { for (let el of this.elements) { el.x -= this.speed; if (el.x < -el.size) { el.x = width + random(el.size); } } } display() { noStroke(); for (let el of this.elements) { fill(el.color); ellipse(el.x, el.y, el.size * 2, el.size * 1.4); } } }