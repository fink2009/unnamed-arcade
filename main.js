// Main entry point for War Shooter game
const canvas = document.getElementById('gameCanvas');
canvas.width = 1200;
canvas.height = 600;

// Initialize and start the game engine
const game = new GameEngine(canvas);

// Expose game to window for debugging
window.game = game;
