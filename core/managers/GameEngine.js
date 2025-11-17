// Main Game Manager - orchestrates all game systems
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game state
    this.state = 'loading'; // loading, menu, character_select, playing, paused, gameover, victory
    this.mode = 'campaign'; // campaign, survival, multiplayer
    this.menuState = 'main';
    
    // Settings
    this.difficulty = 'medium'; // baby, easy, medium, extreme
    this.audioEnabled = true;
    this.musicVolume = 0.7;
    
    // Systems
    this.inputManager = new InputManager();
    this.assetManager = new AssetManager();
    this.collisionSystem = new CollisionSystem();
    this.particleSystem = new ParticleSystem();
    this.achievementSystem = new AchievementSystem();
    this.audioManager = new AudioManager();
    this.highScoreSystem = new HighScoreSystem();
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
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimeout = 3000; // 3 seconds to maintain combo
    this.maxCombo = 0;
    this.totalDamageTaken = 0;
    this.totalDamageDealt = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.playTime = 0;
    this.bossesKilled = 0;
    this.weaponsCollected = 0;
    this.damageTakenThisWave = 0;
    
    // Timing
    this.lastTime = 0;
    this.currentTime = 0;
    this.fps = 60;
    this.fpsFrames = [];
    this.fpsUpdateTime = 0;
    
    // Settings
    this.difficulty = 'medium'; // easy, medium, extreme
    this.audioEnabled = true;
    this.masterVolume = 1.0;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.7;
    this.selectedCharacter = 'soldier';
    this.screenShake = true;
    this.particleQuality = 'high'; // low, medium, high
    this.showFPS = false;
    this.showHelp = false; // Toggle help overlay
    this.cameraSmoothness = 0.1; // 0.05 = smooth, 0.3 = snappy
    this.crosshairStyle = 'cross'; // cross, dot, circle, none
    this.hudOpacity = 0.9;
    this.colorBlindMode = 'none'; // none, protanopia, deuteranopia, tritanopia
    this.autoReload = true;
    this.settingsPage = 0; // For multi-page settings menu
    
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
    this.menuState = null; // Reset menu state to ensure game renders properly
    
    // Reset game state
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.totalDamageTaken = 0;
    this.totalDamageDealt = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.playTime = 0;
    this.bossesKilled = 0;
    this.weaponsCollected = 0;
    this.damageTakenThisWave = 0;
    this.gameStartTime = performance.now();
    
    // Create player with difficulty modifiers
    this.player = new PlayerCharacter(100, this.groundLevel - 50, character);
    
    // Apply difficulty modifiers to player
    if (this.difficulty === 'baby') {
      this.player.maxHealth = Math.floor(this.player.maxHealth * 5); // Very high health for baby mode
      this.player.health = this.player.maxHealth;
    } else if (this.difficulty === 'easy') {
      this.player.maxHealth = Math.floor(this.player.maxHealth * 2.5);
      this.player.health = this.player.maxHealth;
    } else if (this.difficulty === 'extreme') {
      this.player.maxHealth = Math.floor(this.player.maxHealth * 0.7);
      this.player.health = this.player.maxHealth;
    }
    
    // Add spawn protection to prevent instant death
    this.player.invulnerable = true;
    setTimeout(() => {
      if (this.player && this.player.active) {
        this.player.invulnerable = false;
      }
    }, 2000); // 2 seconds of spawn protection
    
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
    let enemyCount = 5 + this.wave * 2;
    let difficultyMultiplier = 1.0;
    
    // Apply difficulty modifiers
    if (this.difficulty === 'baby') {
      enemyCount = Math.max(1, Math.floor(enemyCount * 0.2)); // Very few enemies
      difficultyMultiplier = 0.3; // Very weak enemies
    } else if (this.difficulty === 'easy') {
      enemyCount = Math.floor(enemyCount * 0.4);
      difficultyMultiplier = 0.5;
    } else if (this.difficulty === 'extreme') {
      enemyCount = Math.floor(enemyCount * 1.5);
      difficultyMultiplier = 1.5;
    }
    
    this.enemiesRemaining = enemyCount;
    
    // Determine enemy type distribution based on wave
    let types = ['infantry', 'infantry', 'scout']; // Early waves
    if (this.wave >= 3) {
      types.push('heavy');
    }
    if (this.wave >= 5) {
      types.push('sniper');
    }
    if (this.wave >= 7) {
      types.push('heavy', 'sniper'); // More elite units
    }
    
    for (let i = 0; i < enemyCount; i++) {
      const x = this.player.x + 400 + Math.random() * 1000;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const enemy = new EnemyUnit(x, this.groundLevel - 48, type);
      enemy.applyDifficulty(difficultyMultiplier);
      this.enemies.push(enemy);
      this.collisionSystem.add(enemy);
    }
    
    // Spawn boss every 5 waves
    if (this.wave % 5 === 0 && this.wave > 0) {
      const bossX = this.player.x + 800;
      const boss = new EnemyUnit(bossX, this.groundLevel - 70, 'boss');
      boss.applyDifficulty(difficultyMultiplier);
      this.enemies.push(boss);
      this.collisionSystem.add(boss);
      this.enemiesRemaining++;
    }
  }

  spawnCampaignEnemies() {
    let enemyCount = 10;
    let difficultyMultiplier = 1.0;
    
    // Apply difficulty modifiers
    if (this.difficulty === 'baby') {
      enemyCount = 2; // Very few enemies for baby mode
      difficultyMultiplier = 0.3;
    } else if (this.difficulty === 'easy') {
      enemyCount = 4;
      difficultyMultiplier = 0.5;
    } else if (this.difficulty === 'extreme') {
      enemyCount = 15;
      difficultyMultiplier = 1.5;
    }
    
    // Spawn enemies across the level
    for (let i = 0; i < enemyCount; i++) {
      const x = 500 + i * 200 + Math.random() * 100;
      const type = i % 3 === 0 ? 'heavy' : 'infantry';
      
      const enemy = new EnemyUnit(x, this.groundLevel - 48, type);
      enemy.applyDifficulty(difficultyMultiplier);
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
      } else if (this.inputManager.wasKeyPressed('Escape')) {
        this.menuState = 'main';
      }
    } else if (this.menuState === 'settings') {
      // Page navigation
      if (this.inputManager.wasKeyPressed('ArrowLeft')) {
        this.settingsPage = Math.max(0, this.settingsPage - 1);
      } else if (this.inputManager.wasKeyPressed('ArrowRight')) {
        this.settingsPage = Math.min(2, this.settingsPage + 1);
      }
      
      // Page 0: Difficulty & Audio
      if (this.settingsPage === 0) {
        if (this.inputManager.wasKeyPressed('1')) {
          this.difficulty = 'baby';
        } else if (this.inputManager.wasKeyPressed('2')) {
          this.difficulty = 'easy';
        } else if (this.inputManager.wasKeyPressed('3')) {
          this.difficulty = 'medium';
        } else if (this.inputManager.wasKeyPressed('4')) {
          this.difficulty = 'extreme';
        } else if (this.inputManager.wasKeyPressed('5')) {
          this.audioEnabled = !this.audioEnabled;
        } else if (this.inputManager.wasKeyPressed('6')) {
          this.masterVolume = Math.max(0, this.masterVolume - 0.1);
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.masterVolume = Math.min(1, this.masterVolume + 0.1);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.sfxVolume = Math.max(0, this.sfxVolume - 0.1);
        } else if (this.inputManager.wasKeyPressed('9')) {
          this.sfxVolume = Math.min(1, this.sfxVolume + 0.1);
        } else if (this.inputManager.wasKeyPressed('0')) {
          this.musicVolume = Math.max(0, this.musicVolume - 0.1);
        } else if (this.inputManager.wasKeyPressed('-')) {
          this.musicVolume = Math.min(1, this.musicVolume + 0.1);
        }
      }
      // Page 1: Graphics & Display
      else if (this.settingsPage === 1) {
        if (this.inputManager.wasKeyPressed('1')) {
          this.screenShake = !this.screenShake;
        } else if (this.inputManager.wasKeyPressed('2')) {
          const qualities = ['low', 'medium', 'high'];
          const idx = qualities.indexOf(this.particleQuality);
          this.particleQuality = qualities[(idx + 1) % qualities.length];
        } else if (this.inputManager.wasKeyPressed('3')) {
          this.showFPS = !this.showFPS;
        } else if (this.inputManager.wasKeyPressed('4')) {
          this.cameraSmoothness = Math.max(0.05, this.cameraSmoothness - 0.05);
        } else if (this.inputManager.wasKeyPressed('5')) {
          this.cameraSmoothness = Math.min(0.3, this.cameraSmoothness + 0.05);
        } else if (this.inputManager.wasKeyPressed('6')) {
          const styles = ['cross', 'dot', 'circle', 'none'];
          const idx = styles.indexOf(this.crosshairStyle);
          this.crosshairStyle = styles[(idx + 1) % styles.length];
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.hudOpacity = Math.max(0.3, this.hudOpacity - 0.1);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.hudOpacity = Math.min(1, this.hudOpacity + 0.1);
        }
      }
      // Page 2: Gameplay & Accessibility
      else if (this.settingsPage === 2) {
        if (this.inputManager.wasKeyPressed('1')) {
          this.autoReload = !this.autoReload;
        } else if (this.inputManager.wasKeyPressed('2')) {
          const modes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
          const idx = modes.indexOf(this.colorBlindMode);
          this.colorBlindMode = modes[(idx + 1) % modes.length];
        }
      }
      
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.menuState = 'main';
      }
    } else if (this.menuState === 'controls') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.menuState = 'main';
      }
    } else if (this.menuState === 'highscores') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.menuState = 'main';
      }
    } else if (this.state === 'menu') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.menuState = 'character';
        this.mode = 'campaign';
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.menuState = 'character';
        this.mode = 'survival';
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.menuState = 'settings';
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.menuState = 'controls';
      } else if (this.inputManager.wasKeyPressed('5')) {
        this.menuState = 'highscores';
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
            // Play shoot sound
            this.audioManager.playSound('shoot', 0.5);
            
            // Track shots fired
            if (Array.isArray(result)) {
              this.shotsFired += result.length;
              result.forEach(p => {
                this.projectiles.push(p);
                this.collisionSystem.add(p);
              });
            } else {
              this.shotsFired++;
              this.projectiles.push(result);
              this.collisionSystem.add(result);
            }
          }
        }
        
        // Reload
        if (this.inputManager.isKeyPressed('r') || this.inputManager.isKeyPressed('R')) {
          this.player.reload(this.currentTime);
        }
        
        // Auto-reload when out of ammo
        if (this.autoReload && this.player.getCurrentWeapon().currentAmmo === 0 && 
            !this.player.getCurrentWeapon().isReloading) {
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
        
        // Special Ability (E key or Q key)
        if (this.inputManager.wasKeyPressed('e') || this.inputManager.wasKeyPressed('E') ||
            this.inputManager.wasKeyPressed('q') || this.inputManager.wasKeyPressed('Q')) {
          const result = this.player.useSpecialAbility(this.currentTime, this);
          if (result) {
            // Visual/audio feedback for ability use
            this.audioManager.playSound('ability', 0.8);
            if (result === 'airstrike') {
              this.camera.shake(10, 500);
            }
          }
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
      
      // Toggle help overlay (H key)
      if (this.inputManager.wasKeyPressed('h') || this.inputManager.wasKeyPressed('H')) {
        this.showHelp = !this.showHelp;
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
      } else if (this.inputManager.wasKeyPressed('r') || this.inputManager.wasKeyPressed('R')) {
        this.startGame(this.mode, this.selectedCharacter);
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
      // Player died - save high score and capture final play time
      const accuracy = this.shotsFired > 0 ? 
        ((this.shotsHit / this.shotsFired) * 100).toFixed(1) : 0;
      
      // Capture final play time
      this.finalPlayTime = this.currentTime - this.gameStartTime;
      
      if (this.highScoreSystem.isHighScore(this.score)) {
        this.highScoreSystem.addScore(this.score, this.selectedCharacter, this.difficulty, this.mode, {
          kills: this.kills,
          wave: this.wave,
          accuracy: accuracy
        });
      }
      
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
    
    // Update combo timer
    if (this.combo > 0 && this.currentTime - this.comboTimer > this.comboTimeout) {
      this.combo = 0;
    }
    
    // Check achievements
    this.achievementSystem.update(this);
    
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
        // Wave clear bonus
        const waveBonus = this.wave * 500;
        this.score += waveBonus;
        
        // Reset wave damage tracking
        this.damageTakenThisWave = 0;
        
        this.wave++;
        this.spawnWave();
        this.spawnPickups();
      }
    } else if (this.mode === 'campaign') {
      if (this.enemiesRemaining === 0) {
        // Capture final play time
        this.finalPlayTime = this.currentTime - this.gameStartTime;
        
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
        // Track weapon pickups
        if (pickup.pickupType && pickup.pickupType.startsWith('weapon_')) {
          this.weaponsCollected++;
        }
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
            
            // Track hits and damage
            this.shotsHit++;
            this.totalDamageDealt += proj.damage;
            
            if (killed) {
              this.kills++;
              
              // Play kill sound
              this.audioManager.playSound('enemy_killed', 0.6);
              
              // Combo system
              this.combo++;
              if (this.combo > this.maxCombo) this.maxCombo = this.combo;
              this.comboTimer = this.currentTime;
              const comboBonus = Math.min(this.combo, 10) * 10; // Max 100 bonus points at 10x combo
              const totalPoints = 100 + comboBonus;
              this.score += totalPoints;
              
              // Track boss kills
              if (enemy.enemyType === 'boss') {
                this.bossesKilled++;
              }
              
              this.particleSystem.createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2
              );
              
              // Screen shake on enemy kill
              this.camera.shake(3, 150);
              
              // Show score popup
              let popupText = `+${totalPoints}`;
              let popupColor = '#ffff00';
              if (this.combo > 1) {
                popupText += ` (${this.combo}x)`;
                popupColor = '#ff6600';
              }
              this.particleSystem.createTextPopup(
                enemy.x + enemy.width / 2,
                enemy.y - 20,
                popupText,
                popupColor
              );
              
              // Always spawn pickup when enemy is killed
              // Common drops (70% chance)
              let pickupTypes = ['health', 'ammo', 'healing', 'damage_boost'];
              
              // Rare weapon drops for elite enemies (20% chance)
              if ((enemy.enemyType === 'heavy' || enemy.enemyType === 'sniper') && Math.random() < 0.2) {
                const weaponDrops = ['weapon_rifle', 'weapon_shotgun', 'weapon_machinegun', 'weapon_sniper'];
                pickupTypes = weaponDrops;
              }
              
              // Epic weapon drops for bosses (guaranteed)
              if (enemy.enemyType === 'boss') {
                const epicWeapons = ['weapon_grenade', 'weapon_laser', 'weapon_machinegun'];
                pickupTypes = epicWeapons;
              }
              
              const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
              const pickup = new Pickup(enemy.x, enemy.y, type);
              this.pickups.push(pickup);
              this.collisionSystem.add(pickup);
            }
          }
        });
      }
      
      // Enemy projectiles hitting player
      else {
        if (this.player.active && proj.collidesWith(this.player)) {
          const damaged = this.player.takeDamage(proj.damage);
          if (damaged) {
            this.totalDamageTaken += proj.damage;
            this.damageTakenThisWave += proj.damage;
          }
          proj.destroy();
          this.particleSystem.createExplosion(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            10,
            '#ff0000'
          );
          // Screen shake when player takes damage
          this.camera.shake(5, 200);
        }
      }
    });
  }

  render() {
    // Clear canvas with military theme
    this.ctx.fillStyle = '#2d3748'; // Dark military gray-blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.state === 'loading') {
      this.ui.drawLoadingScreen(this.ctx, 1.0);
      return;
    }
    
    if (this.state === 'menu' || this.state === 'paused' || this.state === 'gameover' || this.state === 'victory' || this.menuState === 'character' || this.menuState === 'settings' || this.menuState === 'controls') {
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
        mode: this.mode,
        combo: this.combo
      });
      
      // Draw achievement notifications (without camera transform)
      this.achievementSystem.render(this.ctx, 10, 60);
    }
  }

  renderGame() {
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // Draw sky with gradient (retro military theme)
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.groundLevel);
    skyGradient.addColorStop(0, '#4a5568'); // Dark gray-blue
    skyGradient.addColorStop(1, '#6b7280'); // Lighter gray
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.worldWidth, this.groundLevel);
    
    // Draw distant mountains/buildings (parallax background)
    this.ctx.fillStyle = '#2d3748';
    for (let i = 0; i < this.worldWidth; i += 300) {
      const height = 100 + Math.sin(i * 0.01) * 50;
      this.ctx.fillRect(i, this.groundLevel - height, 250, height);
    }
    
    // Draw ground (military bunker style)
    this.ctx.fillStyle = '#4a4a3a';
    this.ctx.fillRect(0, this.groundLevel, this.worldWidth, this.worldHeight - this.groundLevel);
    
    // Draw grass/debris on top of ground (retro style)
    this.ctx.fillStyle = '#5a5a4a';
    for (let i = 0; i < this.worldWidth; i += 20) {
      const height = 3 + Math.floor(Math.random() * 3);
      this.ctx.fillRect(i, this.groundLevel - height, 15, height);
    }
    
    // Draw obstacles/cover (military crates)
    this.ctx.fillStyle = '#654321';
    for (let i = 0; i < this.worldWidth; i += 400) {
      const x = i + 100;
      const crateSize = 30;
      this.ctx.fillRect(x, this.groundLevel - crateSize, crateSize, crateSize);
      // Crate detail
      this.ctx.strokeStyle = '#4a3219';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, this.groundLevel - crateSize, crateSize, crateSize);
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.groundLevel - crateSize / 2);
      this.ctx.lineTo(x + crateSize, this.groundLevel - crateSize / 2);
      this.ctx.moveTo(x + crateSize / 2, this.groundLevel - crateSize);
      this.ctx.lineTo(x + crateSize / 2, this.groundLevel);
      this.ctx.stroke();
    }
    
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
      
      // Calculate FPS
      if (deltaTime > 0) {
        this.fpsFrames.push(1000 / deltaTime);
        if (this.fpsFrames.length > 60) this.fpsFrames.shift();
        if (timestamp - this.fpsUpdateTime > 500) {
          this.fps = Math.round(this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length);
          this.fpsUpdateTime = timestamp;
        }
      }
      
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
