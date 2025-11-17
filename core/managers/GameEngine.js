// Main Game Manager - orchestrates all game systems
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game state
    this.state = 'loading'; // loading, menu, character_select, playing, paused, gameover, victory
    this.mode = 'campaign'; // campaign, survival, multiplayer
    this.menuState = 'main';
    
    // Systems
    this.inputManager = new InputManager();
    this.assetManager = new AssetManager();
    this.collisionSystem = new CollisionSystem();
    this.particleSystem = new ParticleSystem();
    this.ui = new GameUI(canvas);
    
    // World settings
    this.worldWidth = 3000;
    this.worldHeight = canvas.height;
    this.groundLevel = canvas.height - 50;
    this.camera = new Camera(canvas.width, canvas.height, this.worldWidth, this.worldHeight);
    
    // Game objects
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.obstacles = [];
    
    // Game stats
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.enemiesRemaining = 0;
    this.waveTimer = 0;
    this.waveDuration = 30000; // 30 seconds per wave
    
    // Timing
    this.lastTime = 0;
    this.currentTime = 0;
    
    // Settings
    this.selectedCharacter = 'soldier';
    
    this.init();
  }

  async init() {
    try {
      // Load assets (placeholder - would load actual sprites/sounds)
      // await this.assetManager.loadImage('player', 'assets/sprites/player.png');
      // await this.assetManager.loadSound('shoot', 'assets/sounds/shoot.wav');
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.state = 'menu';
      this.start();
    } catch (error) {
      console.error('Initialization error:', error);
      // Show error message to user
      this.state = 'error';
    }
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  startGame(mode, character) {
    this.mode = mode;
    this.selectedCharacter = character;
    this.state = 'playing';
    
    // Reset game state
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.waveTimer = 0;
    
    // Create player
    this.player = new PlayerCharacter(100, this.groundLevel - 50, character);
    this.camera.follow(this.player);
    
    // Clear arrays
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.collisionSystem.clear();
    this.particleSystem.clear();
    
    // Spawn initial enemies
    if (mode === 'survival') {
      this.spawnWave();
    } else if (mode === 'campaign') {
      this.spawnCampaignEnemies();
    }
    
    // Add some pickups
    this.spawnPickups();
  }

  spawnWave() {
    const enemyCount = 5 + this.wave * 2;
    this.enemiesRemaining = enemyCount;
    
    for (let i = 0; i < enemyCount; i++) {
      const x = this.player.x + 400 + Math.random() * 1000;
      const types = ['infantry', 'heavy', 'scout', 'sniper'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const enemy = new EnemyUnit(x, this.groundLevel - 48, type);
      this.enemies.push(enemy);
      this.collisionSystem.add(enemy);
    }
  }

  spawnCampaignEnemies() {
    // Spawn enemies across the level
    for (let i = 0; i < 10; i++) {
      const x = 500 + i * 200 + Math.random() * 100;
      const type = i % 3 === 0 ? 'heavy' : 'infantry';
      
      const enemy = new EnemyUnit(x, this.groundLevel - 48, type);
      this.enemies.push(enemy);
      this.collisionSystem.add(enemy);
    }
    
    this.enemiesRemaining = this.enemies.length;
  }

  spawnPickups() {
    const pickupTypes = ['health', 'ammo', 'weapon_rifle', 'weapon_shotgun'];
    
    for (let i = 0; i < 5; i++) {
      const x = 300 + i * 400 + Math.random() * 100;
      const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
      
      const pickup = new Pickup(x, this.groundLevel - 30, type);
      this.pickups.push(pickup);
      this.collisionSystem.add(pickup);
    }
  }

  handleInput() {
    if (this.state === 'character_select' || this.menuState === 'character') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.startGame(this.mode, 'soldier');
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.startGame(this.mode, 'scout');
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.startGame(this.mode, 'heavy');
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.startGame(this.mode, 'medic');
      }
    } else if (this.state === 'menu') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.menuState = 'character';
        this.mode = 'campaign';
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.menuState = 'character';
        this.mode = 'survival';
      }
    } else if (this.state === 'playing') {
      // Player controls
      if (this.player && this.player.active) {
        // Shooting
        if (this.inputManager.isMouseButtonPressed(0)) {
          const mousePos = this.inputManager.getMousePosition();
          const worldPos = this.camera.screenToWorld(mousePos.x, mousePos.y);
          const result = this.player.shoot(worldPos.x, worldPos.y, this.currentTime);
          
          if (result) {
            if (Array.isArray(result)) {
              result.forEach(p => {
                this.projectiles.push(p);
                this.collisionSystem.add(p);
              });
            } else {
              this.projectiles.push(result);
              this.collisionSystem.add(result);
            }
          }
        }
        
        // Reload
        if (this.inputManager.isKeyPressed('r') || this.inputManager.isKeyPressed('R')) {
          this.player.reload(this.currentTime);
        }
        
        // Jump
        if ((this.inputManager.isKeyPressed('ArrowUp') || this.inputManager.isKeyPressed('w') || this.inputManager.isKeyPressed(' ')) && this.player.onGround) {
          this.player.dy = this.player.jumpStrength;
          this.player.onGround = false;
        }
        
        // Roll
        if (this.inputManager.isKeyPressed('Shift')) {
          this.player.roll(this.currentTime);
        }
        
        // Weapon switching
        if (this.inputManager.isKeyPressed('1')) {
          this.player.switchWeapon(0);
        } else if (this.inputManager.isKeyPressed('2')) {
          this.player.switchWeapon(1);
        } else if (this.inputManager.isKeyPressed('3')) {
          this.player.switchWeapon(2);
        } else if (this.inputManager.isKeyPressed('4')) {
          this.player.switchWeapon(3);
        }
      }
      
      // Pause
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.state = 'paused';
        this.menuState = 'paused';
      }
    } else if (this.state === 'paused') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.state = 'playing';
      } else if (this.inputManager.wasKeyPressed('m') || this.inputManager.wasKeyPressed('M')) {
        this.state = 'menu';
        this.menuState = 'main';
      }
    } else if (this.state === 'gameover' || this.state === 'victory') {
      if (this.inputManager.wasKeyPressed('r') || this.inputManager.wasKeyPressed('R')) {
        this.startGame(this.mode, this.selectedCharacter);
      } else if (this.inputManager.wasKeyPressed('m') || this.inputManager.wasKeyPressed('M')) {
        this.state = 'menu';
        this.menuState = 'main';
      }
    }
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update player
    if (this.player && this.player.active) {
      this.player.update(deltaTime, this.inputManager, this.groundLevel, this.currentTime, this.worldWidth);
    } else if (this.player && !this.player.active) {
      // Player died
      this.state = 'gameover';
      this.menuState = 'gameover';
      this.ui.setLastScore(this.score);
      return;
    }
    
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player, this.groundLevel, this.currentTime);
      
      // Enemy shooting
      const result = enemy.attack(this.player, this.currentTime);
      if (result) {
        if (Array.isArray(result)) {
          result.forEach(p => {
            this.projectiles.push(p);
            this.collisionSystem.add(p);
          });
        } else {
          this.projectiles.push(result);
          this.collisionSystem.add(result);
        }
      }
    });
    
    // Update projectiles
    this.projectiles.forEach(p => p.update(deltaTime));
    
    // Update pickups
    this.pickups.forEach(p => p.update(deltaTime));
    
    // Update particles
    this.particleSystem.update(deltaTime);
    
    // Update camera
    this.camera.update();
    
    // Handle collisions
    this.handleCollisions();
    
    // Clean up inactive entities
    this.enemies = this.enemies.filter(e => e.active);
    this.projectiles = this.projectiles.filter(p => p.active);
    this.pickups = this.pickups.filter(p => p.active);
    
    // Check wave/level completion
    this.enemiesRemaining = this.enemies.length;
    
    if (this.mode === 'survival') {
      if (this.enemiesRemaining === 0) {
        this.wave++;
        this.spawnWave();
        this.spawnPickups();
      }
    } else if (this.mode === 'campaign') {
      if (this.enemiesRemaining === 0) {
        this.state = 'victory';
        this.menuState = 'victory';
        this.ui.setLastScore(this.score);
      }
    }
  }

  handleCollisions() {
    // Player vs Pickups
    this.pickups.forEach(pickup => {
      if (pickup.active && this.player.collidesWith(pickup)) {
        pickup.apply(this.player);
        this.score += 50;
      }
    });
    
    // Projectiles vs Enemies/Player
    this.projectiles.forEach(proj => {
      if (!proj.active) return;
      
      // Player projectiles hitting enemies
      if (proj.owner instanceof Weapon && proj.owner === this.player.getCurrentWeapon()) {
        this.enemies.forEach(enemy => {
          if (enemy.active && proj.collidesWith(enemy)) {
            const killed = enemy.takeDamage(proj.damage);
            proj.destroy();
            
            if (killed) {
              this.kills++;
              this.score += 100;
              this.particleSystem.createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2
              );
              
              // Chance to spawn pickup
              if (Math.random() < 0.3) {
                const pickupTypes = ['health', 'ammo'];
                const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
                const pickup = new Pickup(enemy.x, enemy.y, type);
                this.pickups.push(pickup);
                this.collisionSystem.add(pickup);
              }
            }
          }
        });
      }
      
      // Enemy projectiles hitting player
      else {
        if (this.player.active && proj.collidesWith(this.player)) {
          this.player.takeDamage(proj.damage);
          proj.destroy();
          this.particleSystem.createExplosion(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            10,
            '#ff0000'
          );
        }
      }
    });
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#87ceeb'; // Sky blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.state === 'loading') {
      this.ui.drawLoadingScreen(this.ctx, 1.0);
      return;
    }
    
    if (this.state === 'menu' || this.state === 'paused' || this.state === 'gameover' || this.state === 'victory' || this.menuState === 'character') {
      // Draw game in background if paused
      if (this.state === 'paused') {
        this.renderGame();
      }
      
      this.ui.drawMenu(this.ctx, this.menuState || this.state);
      return;
    }
    
    if (this.state === 'playing') {
      this.renderGame();
      
      // Draw HUD
      this.ui.drawHUD(this.ctx, this.player, {
        score: this.score,
        kills: this.kills,
        wave: this.wave,
        enemiesRemaining: this.enemiesRemaining,
        mode: this.mode
      });
    }
  }

  renderGame() {
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // Draw ground
    this.ctx.fillStyle = '#8b7355';
    this.ctx.fillRect(0, this.groundLevel, this.worldWidth, this.worldHeight - this.groundLevel);
    
    // Draw grass on top of ground
    this.ctx.fillStyle = '#228b22';
    this.ctx.fillRect(0, this.groundLevel - 5, this.worldWidth, 5);
    
    // Draw pickups
    this.pickups.forEach(p => p.render(this.ctx));
    
    // Draw player
    if (this.player && this.player.active) {
      this.player.render(this.ctx);
    }
    
    // Draw enemies
    this.enemies.forEach(e => e.render(this.ctx));
    
    // Draw projectiles
    this.projectiles.forEach(p => p.render(this.ctx));
    
    // Draw particles
    this.particleSystem.render(this.ctx);
    
    // Reset camera transform
    this.camera.reset(this.ctx);
  }

  gameLoop(timestamp) {
    try {
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;
      this.currentTime = timestamp;
      
      // Handle input
      this.handleInput();
      
      // Update game
      this.update(deltaTime);
      
      // Render game
      this.render();
      
      // Clear pressed keys for next frame
      this.inputManager.clearPressedKeys();
    } catch (error) {
      console.error('Game loop error:', error);
      // Continue running even if there's an error
    }
    
    // Continue loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}
