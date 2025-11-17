const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let lastTime = 0;

// Game Objects
let player, enemies, level;

// Initialize Game
function init() {
  player = new Player(50, 300);
  enemies = [new Enemy(600, 300)];
  level = new Level();

  requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Game Updates
  player.update(deltaTime);
  enemies.forEach(enemy => enemy.update(player));
  level.update();

  // Game Renders
  level.render(ctx);
  player.render(ctx);
  enemies.forEach(enemy => enemy.render(ctx));

  requestAnimationFrame(gameLoop);
}

init();