// Main Game Manager - orchestrates all game systems
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game Engine initialized with comprehensive improvements
    
    // Game state
    this.state = 'loading'; // loading, menu, character_select, playing, paused, gameover, victory, inventory
    this.mode = 'campaign'; // campaign, survival, multiplayer
    this.menuState = 'main';
    this.showInventory = false;
    
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
    
    // Level terrain (platforms, slopes, etc.)
    this.platforms = [];
    this.slopes = [];
    
    // Game objects
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.covers = [];
    
    // Game stats
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.currentLevel = 1; // Campaign level
    this.maxLevel = 10; // Total campaign levels including boss arenas
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
    
    // Weapon swap system
    this.weaponSwapPopup = null; // {weapon: Weapon, pickup: Pickup}
    
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
    this.bloodEffects = true; // Toggle blood/gore effects
    this.enemyAggression = 1.0; // Enemy behavior multiplier
    this.bulletSpeed = 1.0; // Projectile speed multiplier
    this.explosionSize = 1.0; // Explosion visual size multiplier
    this.screenFlash = true; // Flash on damage/events
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
      
      // Play menu music
      this.audioManager.playMusic('menu');
      
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
    
    // Start gameplay music
    this.audioManager.stopMusic();
    this.audioManager.playMusic('gameplay');
    
    // Reset game state
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.currentLevel = 1;
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
    this.covers = [];
    this.collisionSystem.clear();
    this.particleSystem.clear();
    
    // Spawn cover objects
    this.spawnCovers();
    
    // Spawn level terrain (platforms, slopes)
    this.spawnLevelTerrain();
    
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
    // Define campaign levels with increasing difficulty and variety
    const levels = [
      // Level 1: Basic Training - Infantry only
      {
        name: 'Basic Training',
        enemies: [
          { type: 'infantry', count: 3, spacing: 300 },
          { type: 'scout', count: 2, spacing: 400 }
        ]
      },
      // Level 2: First Contact - Mixed units
      {
        name: 'First Contact',
        enemies: [
          { type: 'infantry', count: 4, spacing: 250 },
          { type: 'heavy', count: 2, spacing: 500 },
          { type: 'scout', count: 3, spacing: 350 }
        ]
      },
      // Level 3: Boss Arena - First Boss
      {
        name: 'Boss Arena: The Warlord',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 1500, bossId: 0 }
        ],
        isBossLevel: true
      },
      // Level 4: Heavy Assault - Many heavy units
      {
        name: 'Heavy Assault',
        enemies: [
          { type: 'heavy', count: 3, spacing: 400 },
          { type: 'infantry', count: 5, spacing: 250 },
          { type: 'sniper', count: 2, spacing: 600 }
        ]
      },
      // Level 5: Sniper Alley - Long range combat
      {
        name: 'Sniper Alley',
        enemies: [
          { type: 'sniper', count: 4, spacing: 500 },
          { type: 'scout', count: 4, spacing: 300 },
          { type: 'heavy', count: 2, spacing: 600 }
        ]
      },
      // Level 6: Boss Arena - Elite Commander
      {
        name: 'Boss Arena: The Devastator',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 1800, bossId: 1 }
        ],
        isBossLevel: true
      },
      // Level 7: Urban Warfare - City ruins with multi-tier combat
      {
        name: 'Urban Warfare',
        enemies: [
          { type: 'infantry', count: 5, spacing: 280 },
          { type: 'heavy', count: 3, spacing: 450 },
          { type: 'sniper', count: 4, spacing: 550 },
          { type: 'scout', count: 4, spacing: 320 }
        ]
      },
      // Level 8: Industrial Complex - Factory with moving platforms feel
      {
        name: 'Industrial Complex',
        enemies: [
          { type: 'infantry', count: 6, spacing: 300 },
          { type: 'heavy', count: 4, spacing: 420 },
          { type: 'sniper', count: 3, spacing: 600 },
          { type: 'scout', count: 5, spacing: 340 }
        ]
      },
      // Level 9: Elite Commander Boss - Toughest boss before final
      {
        name: 'Boss Arena: The Annihilator',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 1900, bossId: 2 }
        ],
        isBossLevel: true
      },
      // Level 10: Final Stand - Maximum difficulty ultimate level
      {
        name: 'Final Boss: The Overlord',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 2200, bossId: 3 }
        ],
        isBossLevel: true
      }
    ];
    
    // Get current level config (clamped to available levels)
    const levelIndex = Math.min(this.currentLevel - 1, levels.length - 1);
    const levelConfig = levels[levelIndex];
    
    // Apply difficulty modifiers
    let difficultyMultiplier = 1.0;
    let countMultiplier = 1.0;
    
    if (this.difficulty === 'baby') {
      countMultiplier = 0.4; // 60% fewer enemies
      difficultyMultiplier = 0.3;
    } else if (this.difficulty === 'easy') {
      countMultiplier = 0.6; // 40% fewer enemies
      difficultyMultiplier = 0.5;
    } else if (this.difficulty === 'extreme') {
      countMultiplier = 1.3; // 30% more enemies
      difficultyMultiplier = 1.5;
    }
    
    // Spawn enemies based on level config
    let xOffset = 500;
    levelConfig.enemies.forEach(enemyGroup => {
      const adjustedCount = Math.max(1, Math.floor(enemyGroup.count * countMultiplier));
      
      for (let i = 0; i < adjustedCount; i++) {
        const x = enemyGroup.position !== undefined ? 
          enemyGroup.position : 
          xOffset + i * enemyGroup.spacing + Math.random() * 100;
        
        const enemy = new EnemyUnit(x, this.groundLevel - (enemyGroup.type === 'boss' ? 70 : 48), enemyGroup.type);
        enemy.applyDifficulty(difficultyMultiplier);
        
        // Apply boss-specific enhancements and mechanics
        if (enemyGroup.type === 'boss') {
          const bossId = enemyGroup.bossId !== undefined ? enemyGroup.bossId : 0;
          
          // Base boss enhancements - ALL bosses are much stronger
          enemy.maxHealth *= 8; // 8x base health for all bosses
          enemy.health = enemy.maxHealth;
          enemy.damage *= 2.5; // 2.5x more damage
          enemy.speed *= 1.5; // 1.5x faster
          enemy.shootCooldown *= 0.4; // Shoots 2.5x faster
          enemy.aggroRange = 1000; // Massive aggro range
          enemy.attackRange = 800; // Long attack range
          enemy.isBoss = true;
          enemy.bossId = bossId;
          enemy.bossName = this.getBossName(bossId);
          
          // Boss-specific unique mechanics
          switch (bossId) {
            case 0: // The Warlord - First boss (Level 3)
              enemy.bossName = 'The Warlord';
              enemy.maxHealth *= 1.0; // Standard boss health
              enemy.specialMechanic = 'rage'; // Gets faster and stronger below 50% HP
              break;
            case 1: // The Devastator - Second boss (Level 6)
              enemy.bossName = 'The Devastator';
              enemy.maxHealth *= 1.5; // 50% more health
              enemy.specialMechanic = 'summon'; // Can summon minions
              enemy.summonCooldown = 15000; // Summon every 15 seconds
              enemy.lastSummonTime = 0;
              break;
            case 2: // The Annihilator - Third boss (Level 9)
              enemy.bossName = 'The Annihilator';
              enemy.maxHealth *= 2.0; // 2x health
              enemy.specialMechanic = 'shield'; // Periodic shield phases
              enemy.shieldCooldown = 20000;
              enemy.lastShieldTime = 0;
              enemy.shieldActive = false;
              break;
            case 3: // The Overlord - Final boss (Level 10)
              enemy.bossName = 'The Overlord';
              enemy.maxHealth *= 3.0; // 3x health - FINAL BOSS
              enemy.damage *= 1.5; // Even more damage
              enemy.speed *= 1.3; // Even faster
              enemy.shootCooldown *= 0.7; // Shoots even faster
              enemy.specialMechanic = 'all'; // All mechanics combined
              enemy.isFinalBoss = true;
              enemy.summonCooldown = 12000;
              enemy.lastSummonTime = 0;
              enemy.shieldCooldown = 18000;
              enemy.lastShieldTime = 0;
              enemy.shieldActive = false;
              break;
          }
          
          enemy.health = enemy.maxHealth;
        }
        
        this.enemies.push(enemy);
        this.collisionSystem.add(enemy);
      }
      
      if (enemyGroup.position === undefined) {
        xOffset += adjustedCount * enemyGroup.spacing + 200;
      }
    });
    
    this.enemiesRemaining = this.enemies.length;
    this.currentLevelName = levelConfig.name;
    this.isBossLevel = levelConfig.isBossLevel || false;
  }
  
  getBossName(bossId) {
    const bossNames = [
      'The Warlord',
      'The Devastator',
      'The Annihilator',
      'The Overlord'
    ];
    return bossNames[bossId] || 'Unknown Boss';
  }

  spawnPickups() {
    const pickupTypes = ['health', 'ammo', 'weapon_rifle', 'weapon_shotgun', 'weapon_knife', 'weapon_sword', 'weapon_axe'];
    
    for (let i = 0; i < 5; i++) {
      const x = 300 + i * 400 + Math.random() * 100;
      let y = this.groundLevel - 30;
      
      // Check if there's a platform at this position and spawn on it
      let spawnedOnPlatform = false;
      for (const platform of this.platforms) {
        if (x >= platform.x && x <= platform.x + platform.width) {
          y = platform.y - 30;
          spawnedOnPlatform = true;
          break;
        }
      }
      
      const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
      const pickup = new Pickup(x, y, type);
      this.pickups.push(pickup);
      this.collisionSystem.add(pickup);
    }
  }

  spawnCovers() {
    // Spawn cover objects strategically based on current level
    const coverConfigs = this.getLevelCoverConfig();
    
    coverConfigs.forEach(coverData => {
      const cover = new Cover(
        coverData.x, 
        coverData.y !== undefined ? coverData.y : this.groundLevel - coverData.size,
        coverData.size, 
        coverData.size, 
        coverData.type || 'crate'
      );
      this.covers.push(cover);
      this.collisionSystem.add(cover);
    });
  }
  
  getLevelCoverConfig() {
    // Strategic cover placement for each level
    const coverConfigs = [
      // Level 1: Basic Training - Simple cover for learning
      [
        { x: 350, size: 30 },
        { x: 700, size: 30 },
        { x: 1050, size: 30 },
        { x: 1400, size: 30 },
        { x: 1750, size: 30 },
      ],
      
      // Level 2: First Contact - More scattered for tactical play
      [
        { x: 300, size: 30 },
        { x: 550, size: 35 },
        { x: 850, size: 30 },
        { x: 1150, size: 35 },
        { x: 1450, size: 30 },
        { x: 1750, size: 30 },
      ],
      
      // Level 3: Boss Arena - Strategic positions around arena
      [
        { x: 450, size: 40 },
        { x: 700, size: 35 },
        { x: 1000, size: 40 },
        { x: 1300, size: 35 },
        { x: 1550, size: 40 },
      ],
      
      // Level 4: Heavy Assault - More cover for heavy combat
      [
        { x: 250, size: 35 },
        { x: 500, size: 40 },
        { x: 750, size: 35 },
        { x: 1000, size: 40 },
        { x: 1250, size: 35 },
        { x: 1500, size: 40 },
        { x: 1750, size: 35 },
      ],
      
      // Level 5: Sniper Alley - Scattered cover, more focus on platforms
      [
        { x: 280, size: 30 },
        { x: 550, size: 35 },
        { x: 800, size: 30 },
        { x: 1100, size: 35 },
        { x: 1350, size: 30 },
        { x: 1650, size: 30 },
      ],
      
      // Level 6: Boss Arena - Heavy cover for intense boss fight
      [
        { x: 400, size: 45 },
        { x: 650, size: 40 },
        { x: 950, size: 45 },
        { x: 1250, size: 40 },
        { x: 1500, size: 45 },
      ],
      
      // Level 7: Urban Warfare - Rubble and debris as cover
      [
        { x: 200, size: 40 },
        { x: 450, size: 35 },
        { x: 700, size: 45 },
        { x: 950, size: 40 },
        { x: 1200, size: 35 },
        { x: 1450, size: 40 },
        { x: 1700, size: 35 },
      ],
      
      // Level 8: Industrial Complex - Machinery as cover
      [
        { x: 300, size: 40 },
        { x: 580, size: 45 },
        { x: 850, size: 40 },
        { x: 1120, size: 45 },
        { x: 1400, size: 40 },
        { x: 1670, size: 40 },
      ],
      
      // Level 9: Elite Commander Boss - Dense cover for survival
      [
        { x: 350, size: 45 },
        { x: 600, size: 40 },
        { x: 900, size: 50 },
        { x: 1200, size: 40 },
        { x: 1450, size: 45 },
        { x: 1700, size: 40 },
      ],
      
      // Level 10: Final Stand - Maximum cover for final battle
      [
        { x: 250, size: 40 },
        { x: 450, size: 45 },
        { x: 650, size: 40 },
        { x: 850, size: 50 },
        { x: 1050, size: 45 },
        { x: 1250, size: 40 },
        { x: 1450, size: 45 },
        { x: 1650, size: 40 },
        { x: 1850, size: 40 },
      ],
    ];
    
    const levelIndex = Math.min(this.currentLevel - 1, coverConfigs.length - 1);
    return coverConfigs[levelIndex] || coverConfigs[0];
  }
  
  spawnLevelTerrain() {
    // Clear existing terrain
    this.platforms = [];
    this.slopes = [];
    
    // Create terrain based on current level
    const terrainConfig = this.getLevelTerrainConfig();
    
    // Spawn platforms
    if (terrainConfig.platforms) {
      terrainConfig.platforms.forEach(pData => {
        const platform = new Platform(pData.x, pData.y, pData.width, pData.height, pData.type || 'solid');
        this.platforms.push(platform);
      });
    }
    
    // Spawn slopes
    if (terrainConfig.slopes) {
      terrainConfig.slopes.forEach(sData => {
        const slope = new Slope(sData.x, sData.y, sData.width, sData.height, sData.direction);
        this.slopes.push(slope);
      });
    }
  }
  
  getLevelTerrainConfig() {
    // Define unique terrain for each level (Gunstar Heroes / Contra style)
    // Improved for better flow, cohesion, and strategic gameplay
    const terrainConfigs = [
      // Level 1: Basic Training - Gentle introduction with connected platforms
      {
        platforms: [
          // Starting area - low platform for easy access
          { x: 450, y: this.groundLevel - 80, width: 200, height: 20, type: 'passthrough' },
          // Mid-level platform with good spacing
          { x: 800, y: this.groundLevel - 120, width: 220, height: 20, type: 'passthrough' },
          // Higher platform for vertical gameplay introduction
          { x: 1150, y: this.groundLevel - 100, width: 200, height: 20, type: 'passthrough' },
          // End platform
          { x: 1500, y: this.groundLevel - 90, width: 180, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Gentle introductory slope at the start
          { x: 200, y: this.groundLevel - 60, width: 200, height: 60, direction: 'up' },
        ]
      },
      
      // Level 2: First Contact - Flowing terrain with natural progression
      {
        platforms: [
          // Lower tier - connected series
          { x: 350, y: this.groundLevel - 100, width: 220, height: 20, type: 'passthrough' },
          { x: 700, y: this.groundLevel - 140, width: 200, height: 20, type: 'passthrough' },
          // Upper tier - accessible from lower tier
          { x: 1000, y: this.groundLevel - 180, width: 240, height: 20, type: 'passthrough' },
          { x: 1350, y: this.groundLevel - 160, width: 220, height: 20, type: 'passthrough' },
          // High platform for sniping position
          { x: 1700, y: this.groundLevel - 200, width: 200, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry slope
          { x: 150, y: this.groundLevel - 70, width: 180, height: 70, direction: 'up' },
          // Connecting slopes between platform tiers
          { x: 570, y: this.groundLevel - 100, width: 130, height: 40, direction: 'up' },
          { x: 900, y: this.groundLevel - 140, width: 100, height: 40, direction: 'up' },
          // Exit slope
          { x: 1900, y: this.groundLevel - 120, width: 150, height: 120, direction: 'down' },
        ]
      },
      
      // Level 3: Boss Arena - Symmetrical multi-tier arena with strategic positions
      {
        platforms: [
          // Ground level side platforms (solid for cover)
          { x: 250, y: this.groundLevel - 120, width: 280, height: 30, type: 'solid' },
          { x: 1470, y: this.groundLevel - 120, width: 280, height: 30, type: 'solid' },
          // Mid-level platforms (solid, creates layered arena feel)
          { x: 400, y: this.groundLevel - 200, width: 260, height: 30, type: 'solid' },
          { x: 1340, y: this.groundLevel - 200, width: 260, height: 30, type: 'solid' },
          // Center high ground (passthrough, allows tactical positioning)
          { x: 750, y: this.groundLevel - 260, width: 500, height: 25, type: 'passthrough' },
          // Small side perches for dodge opportunities
          { x: 150, y: this.groundLevel - 180, width: 100, height: 20, type: 'passthrough' },
          { x: 1750, y: this.groundLevel - 180, width: 100, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Slopes to access side platforms
          { x: 100, y: this.groundLevel - 120, width: 150, height: 120, direction: 'up' },
          { x: 1750, y: this.groundLevel - 120, width: 150, height: 120, direction: 'down' },
        ]
      },
      
      // Level 4: Heavy Assault - Industrial zone with conveyor-like platforms
      {
        platforms: [
          // Lower industrial walkways
          { x: 280, y: this.groundLevel - 110, width: 240, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          { x: 970, y: this.groundLevel - 110, width: 240, height: 20, type: 'passthrough' },
          { x: 1340, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          // Upper industrial level
          { x: 400, y: this.groundLevel - 200, width: 280, height: 20, type: 'passthrough' },
          { x: 800, y: this.groundLevel - 240, width: 300, height: 20, type: 'passthrough' },
          { x: 1220, y: this.groundLevel - 200, width: 280, height: 20, type: 'passthrough' },
          // High observation deck
          { x: 850, y: this.groundLevel - 320, width: 300, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry ramps
          { x: 150, y: this.groundLevel - 80, width: 130, height: 80, direction: 'up' },
          // Connecting slopes between levels
          { x: 520, y: this.groundLevel - 110, width: 130, height: 90, direction: 'up' },
          { x: 850, y: this.groundLevel - 130, width: 120, height: 110, direction: 'up' },
          { x: 1210, y: this.groundLevel - 110, width: 130, height: 90, direction: 'up' },
          { x: 680, y: this.groundLevel - 200, width: 120, height: 40, direction: 'up' },
          { x: 1100, y: this.groundLevel - 240, width: 120, height: 40, direction: 'down' },
        ]
      },
      
      // Level 5: Sniper Alley - Verticality with sniper positions and cover
      {
        platforms: [
          // Ground level cover platforms (staggered)
          { x: 300, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          { x: 600, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          { x: 900, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          { x: 1200, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          // Mid-level sniper positions
          { x: 400, y: this.groundLevel - 180, width: 200, height: 20, type: 'passthrough' },
          { x: 800, y: this.groundLevel - 210, width: 220, height: 20, type: 'passthrough' },
          { x: 1200, y: this.groundLevel - 180, width: 200, height: 20, type: 'passthrough' },
          // High ground sniper nests
          { x: 250, y: this.groundLevel - 280, width: 240, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 320, width: 300, height: 20, type: 'passthrough' },
          { x: 1110, y: this.groundLevel - 280, width: 240, height: 20, type: 'passthrough' },
          // Ultra-high vantage point
          { x: 700, y: this.groundLevel - 400, width: 300, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Access slopes to different tiers
          { x: 150, y: this.groundLevel - 140, width: 150, height: 140, direction: 'up' },
          { x: 460, y: this.groundLevel - 100, width: 140, height: 80, direction: 'up' },
          { x: 600, y: this.groundLevel - 180, width: 150, height: 100, direction: 'up' },
          { x: 1020, y: this.groundLevel - 210, width: 180, height: 70, direction: 'down' },
          { x: 1400, y: this.groundLevel - 180, width: 160, height: 100, direction: 'down' },
        ]
      },
      
      // Level 6: Boss Arena - Epic large-scale arena with multiple tiers
      {
        platforms: [
          // Ground tier (solid platforms for cover and movement)
          { x: 200, y: this.groundLevel - 130, width: 300, height: 30, type: 'solid' },
          { x: 1500, y: this.groundLevel - 130, width: 300, height: 30, type: 'solid' },
          // Mid-level strategic positions (solid)
          { x: 350, y: this.groundLevel - 210, width: 280, height: 30, type: 'solid' },
          { x: 800, y: this.groundLevel - 250, width: 400, height: 30, type: 'solid' },
          { x: 1370, y: this.groundLevel - 210, width: 280, height: 30, type: 'solid' },
          // Upper tactical platforms (passthrough for flexibility)
          { x: 500, y: this.groundLevel - 320, width: 280, height: 25, type: 'passthrough' },
          { x: 1220, y: this.groundLevel - 320, width: 280, height: 25, type: 'passthrough' },
          // Central high ground (for dramatic boss battles)
          { x: 780, y: this.groundLevel - 380, width: 440, height: 25, type: 'passthrough' },
          // Side observation points
          { x: 100, y: this.groundLevel - 180, width: 120, height: 20, type: 'passthrough' },
          { x: 1780, y: this.groundLevel - 180, width: 120, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry slopes to ground platforms
          { x: 80, y: this.groundLevel - 130, width: 120, height: 130, direction: 'up' },
          { x: 1800, y: this.groundLevel - 130, width: 120, height: 130, direction: 'down' },
          // Connecting slopes between tiers
          { x: 500, y: this.groundLevel - 130, width: 150, height: 80, direction: 'up' },
          { x: 1350, y: this.groundLevel - 130, width: 150, height: 80, direction: 'up' },
          { x: 630, y: this.groundLevel - 210, width: 170, height: 110, direction: 'up' },
        ]
      },
      
      // Level 7: Urban Warfare - Ruined city with integrated debris and buildings
      {
        platforms: [
          // Destroyed building floors (staggered for ruins feel)
          { x: 250, y: this.groundLevel - 120, width: 180, height: 20, type: 'passthrough' },
          { x: 520, y: this.groundLevel - 160, width: 200, height: 25, type: 'solid' },
          { x: 820, y: this.groundLevel - 140, width: 180, height: 20, type: 'passthrough' },
          { x: 1080, y: this.groundLevel - 180, width: 220, height: 25, type: 'solid' },
          { x: 1400, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          // Upper floors of damaged buildings
          { x: 300, y: this.groundLevel - 220, width: 240, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 260, width: 260, height: 20, type: 'passthrough' },
          { x: 1000, y: this.groundLevel - 280, width: 280, height: 20, type: 'passthrough' },
          { x: 1390, y: this.groundLevel - 240, width: 240, height: 20, type: 'passthrough' },
          // Rooftop access
          { x: 700, y: this.groundLevel - 360, width: 320, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Rubble slopes (natural debris feel)
          { x: 150, y: this.groundLevel - 80, width: 100, height: 80, direction: 'up' },
          { x: 430, y: this.groundLevel - 120, width: 90, height: 40, direction: 'up' },
          { x: 720, y: this.groundLevel - 160, width: 100, height: 20, direction: 'down' },
          { x: 1000, y: this.groundLevel - 140, width: 80, height: 40, direction: 'up' },
          { x: 1300, y: this.groundLevel - 180, width: 100, height: 50, direction: 'down' },
          { x: 540, y: this.groundLevel - 220, width: 110, height: 60, direction: 'up' },
          { x: 910, y: this.groundLevel - 260, width: 90, height: 40, direction: 'up' },
        ]
      },
      
      // Level 8: Industrial Complex - Layered factory with machinery feel
      {
        platforms: [
          // Ground level machinery platforms (solid, like machines)
          { x: 200, y: this.groundLevel - 130, width: 240, height: 25, type: 'solid' },
          { x: 550, y: this.groundLevel - 140, width: 220, height: 25, type: 'solid' },
          { x: 880, y: this.groundLevel - 130, width: 240, height: 25, type: 'solid' },
          { x: 1230, y: this.groundLevel - 140, width: 220, height: 25, type: 'solid' },
          { x: 1560, y: this.groundLevel - 130, width: 240, height: 25, type: 'solid' },
          // Mid-level catwalks
          { x: 280, y: this.groundLevel - 220, width: 280, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 250, width: 260, height: 20, type: 'passthrough' },
          { x: 1000, y: this.groundLevel - 240, width: 280, height: 20, type: 'passthrough' },
          { x: 1370, y: this.groundLevel - 220, width: 280, height: 20, type: 'passthrough' },
          // Upper maintenance walkways
          { x: 350, y: this.groundLevel - 330, width: 320, height: 20, type: 'passthrough' },
          { x: 800, y: this.groundLevel - 360, width: 380, height: 20, type: 'passthrough' },
          { x: 1280, y: this.groundLevel - 330, width: 320, height: 20, type: 'passthrough' },
          // Control room level (highest)
          { x: 750, y: this.groundLevel - 440, width: 500, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Conveyor belt style slopes
          { x: 140, y: this.groundLevel - 90, width: 60, height: 90, direction: 'up' },
          { x: 440, y: this.groundLevel - 130, width: 110, height: 90, direction: 'up' },
          { x: 770, y: this.groundLevel - 140, width: 110, height: 80, direction: 'down' },
          { x: 1120, y: this.groundLevel - 130, width: 110, height: 110, direction: 'up' },
          { x: 1450, y: this.groundLevel - 140, width: 110, height: 80, direction: 'down' },
          // Access to catwalks
          { x: 560, y: this.groundLevel - 220, width: 90, height: 110, direction: 'up' },
          { x: 910, y: this.groundLevel - 250, width: 90, height: 110, direction: 'down' },
          { x: 1280, y: this.groundLevel - 240, width: 90, height: 90, direction: 'down' },
        ]
      },
      
      // Level 9: Elite Commander Boss - Intimidating arena with tactical depth
      {
        platforms: [
          // Ground tier - wide platforms for mobility
          { x: 230, y: this.groundLevel - 150, width: 320, height: 30, type: 'solid' },
          { x: 1450, y: this.groundLevel - 150, width: 320, height: 30, type: 'solid' },
          // Mid-tier defensive positions
          { x: 400, y: this.groundLevel - 230, width: 300, height: 30, type: 'solid' },
          { x: 850, y: this.groundLevel - 270, width: 400, height: 30, type: 'solid' },
          { x: 1300, y: this.groundLevel - 230, width: 300, height: 30, type: 'solid' },
          // Upper tactical advantages
          { x: 520, y: this.groundLevel - 340, width: 300, height: 25, type: 'passthrough' },
          { x: 1180, y: this.groundLevel - 340, width: 300, height: 25, type: 'passthrough' },
          // Central commanding position
          { x: 820, y: this.groundLevel - 420, width: 460, height: 25, type: 'passthrough' },
          // Side flanking positions
          { x: 120, y: this.groundLevel - 200, width: 130, height: 20, type: 'passthrough' },
          { x: 1750, y: this.groundLevel - 200, width: 130, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Major access slopes
          { x: 80, y: this.groundLevel - 150, width: 150, height: 150, direction: 'up' },
          { x: 1770, y: this.groundLevel - 150, width: 150, height: 150, direction: 'down' },
          // Mid-tier connections
          { x: 550, y: this.groundLevel - 150, width: 150, height: 80, direction: 'up' },
          { x: 1300, y: this.groundLevel - 150, width: 150, height: 80, direction: 'up' },
          { x: 700, y: this.groundLevel - 230, width: 150, height: 110, direction: 'up' },
          { x: 1150, y: this.groundLevel - 270, width: 150, height: 70, direction: 'down' },
        ]
      },
      
      // Level 10: Final Stand - Epic finale with maximum terrain complexity
      {
        platforms: [
          // Ground level - multiple short platforms (chaotic battlefield feel)
          { x: 200, y: this.groundLevel - 120, width: 200, height: 20, type: 'passthrough' },
          { x: 480, y: this.groundLevel - 140, width: 180, height: 20, type: 'passthrough' },
          { x: 740, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          { x: 1020, y: this.groundLevel - 150, width: 180, height: 20, type: 'passthrough' },
          { x: 1280, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          { x: 1560, y: this.groundLevel - 140, width: 180, height: 20, type: 'passthrough' },
          // Mid-level fortifications (solid for defensive play)
          { x: 320, y: this.groundLevel - 220, width: 260, height: 25, type: 'solid' },
          { x: 700, y: this.groundLevel - 260, width: 300, height: 25, type: 'solid' },
          { x: 1120, y: this.groundLevel - 240, width: 280, height: 25, type: 'solid' },
          { x: 1520, y: this.groundLevel - 220, width: 260, height: 25, type: 'solid' },
          // Upper battlefield layer
          { x: 400, y: this.groundLevel - 330, width: 300, height: 20, type: 'passthrough' },
          { x: 820, y: this.groundLevel - 360, width: 360, height: 20, type: 'passthrough' },
          { x: 1300, y: this.groundLevel - 330, width: 300, height: 20, type: 'passthrough' },
          // Elite vantage points (highest tier)
          { x: 500, y: this.groundLevel - 440, width: 280, height: 20, type: 'passthrough' },
          { x: 1220, y: this.groundLevel - 440, width: 280, height: 20, type: 'passthrough' },
          // Ultimate high ground (final stand position)
          { x: 780, y: this.groundLevel - 520, width: 440, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry slopes (both sides)
          { x: 100, y: this.groundLevel - 90, width: 100, height: 90, direction: 'up' },
          { x: 1800, y: this.groundLevel - 90, width: 100, height: 90, direction: 'down' },
          // Connecting slopes to mid-level
          { x: 400, y: this.groundLevel - 140, width: 80, height: 80, direction: 'up' },
          { x: 660, y: this.groundLevel - 150, width: 80, height: 110, direction: 'up' },
          { x: 940, y: this.groundLevel - 130, width: 80, height: 130, direction: 'up' },
          { x: 1200, y: this.groundLevel - 150, width: 80, height: 90, direction: 'up' },
          { x: 1480, y: this.groundLevel - 140, width: 80, height: 80, direction: 'up' },
          // Upper tier access slopes
          { x: 580, y: this.groundLevel - 220, width: 120, height: 110, direction: 'up' },
          { x: 1000, y: this.groundLevel - 260, width: 120, height: 100, direction: 'down' },
          { x: 1400, y: this.groundLevel - 240, width: 120, height: 90, direction: 'up' },
          // Elite tier slopes
          { x: 700, y: this.groundLevel - 330, width: 120, height: 110, direction: 'up' },
          { x: 1180, y: this.groundLevel - 360, width: 120, height: 80, direction: 'down' },
        ]
      }
    ];
    
    const levelIndex = Math.min(this.currentLevel - 1, terrainConfigs.length - 1);
    return terrainConfigs[levelIndex];
  }

  handleInput() {
    if (this.state === 'character_select' || this.menuState === 'character') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'soldier');
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'scout');
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'heavy');
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'medic');
      } else if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
        this.audioManager.playMusic('menu');
      }
    } else if (this.menuState === 'settings') {
      // Page navigation
      if (this.inputManager.wasKeyPressed('ArrowLeft')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.settingsPage = Math.max(0, this.settingsPage - 1);
      } else if (this.inputManager.wasKeyPressed('ArrowRight')) {
        this.audioManager.playSound('menu_navigate', 0.3);
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
          this.audioManager.setEnabled(this.audioEnabled);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('6')) {
          this.masterVolume = Math.max(0, this.masterVolume - 0.1);
          this.audioManager.setMasterVolume(this.masterVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.masterVolume = Math.min(1, this.masterVolume + 0.1);
          this.audioManager.setMasterVolume(this.masterVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.sfxVolume = Math.max(0, this.sfxVolume - 0.1);
          this.audioManager.setSFXVolume(this.sfxVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('9')) {
          this.sfxVolume = Math.min(1, this.sfxVolume + 0.1);
          this.audioManager.setSFXVolume(this.sfxVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('0')) {
          this.musicVolume = Math.max(0, this.musicVolume - 0.1);
          this.audioManager.setMusicVolume(this.musicVolume);
        } else if (this.inputManager.wasKeyPressed('-')) {
          this.musicVolume = Math.min(1, this.musicVolume + 0.1);
          this.audioManager.setMusicVolume(this.musicVolume);
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
        } else if (this.inputManager.wasKeyPressed('3')) {
          this.bloodEffects = !this.bloodEffects;
        } else if (this.inputManager.wasKeyPressed('4')) {
          this.screenFlash = !this.screenFlash;
        } else if (this.inputManager.wasKeyPressed('5')) {
          this.enemyAggression = Math.max(0.5, this.enemyAggression - 0.1);
        } else if (this.inputManager.wasKeyPressed('6')) {
          this.enemyAggression = Math.min(2.0, this.enemyAggression + 0.1);
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.bulletSpeed = Math.max(0.5, this.bulletSpeed - 0.1);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.bulletSpeed = Math.min(2.0, this.bulletSpeed + 0.1);
        } else if (this.inputManager.wasKeyPressed('9')) {
          this.explosionSize = Math.max(0.5, this.explosionSize - 0.1);
        } else if (this.inputManager.wasKeyPressed('0')) {
          this.explosionSize = Math.min(2.0, this.explosionSize + 0.1);
        }
      }
      
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
      }
    } else if (this.menuState === 'controls') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
      }
    } else if (this.menuState === 'highscores') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
      }
    } else if (this.state === 'menu') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'campaign';
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'survival';
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'settings';
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'controls';
      } else if (this.inputManager.wasKeyPressed('5')) {
        this.audioManager.playSound('menu_select', 0.5);
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
            // Play weapon-specific sound
            const weapon = this.player.getCurrentWeapon();
            let soundName = 'shoot';
            
            if (weapon.name === 'Pistol') soundName = 'shoot_pistol';
            else if (weapon.name === 'Rifle') soundName = 'shoot_rifle';
            else if (weapon.name === 'Shotgun') soundName = 'shoot_shotgun';
            else if (weapon.name === 'Machine Gun') soundName = 'shoot_machinegun';
            else if (weapon.name === 'Sniper Rifle') soundName = 'shoot_sniper';
            else if (weapon.name === 'Grenade Launcher') soundName = 'shoot_grenade';
            else if (weapon.name === 'Laser Gun') soundName = 'shoot_laser';
            else if (weapon.isMelee) soundName = 'shoot_melee';
            
            this.audioManager.playSound(soundName, 0.5);
            
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
          const weapon = this.player.getCurrentWeapon();
          if (!weapon.isReloading && weapon.currentAmmo < weapon.ammoCapacity) {
            this.player.reload(this.currentTime);
            this.audioManager.playSound('reload', 0.4);
          }
        }
        
        // Auto-reload when out of ammo
        if (this.autoReload && this.player.getCurrentWeapon().currentAmmo === 0 && 
            !this.player.getCurrentWeapon().isReloading) {
          this.player.reload(this.currentTime);
          this.audioManager.playSound('reload', 0.4);
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
            // Play ability-specific sound
            let abilitySound = 'ability';
            if (result === 'airstrike') {
              abilitySound = 'ability_airstrike';
              this.camera.shake(10, 500);
            } else if (result === 'sprint') {
              abilitySound = 'ability_sprint';
            } else if (result === 'shield') {
              abilitySound = 'ability_shield';
            } else if (result === 'medpack') {
              abilitySound = 'ability_medpack';
            }
            this.audioManager.playSound(abilitySound, 0.8);
          }
        }
        
        // Weapon switching
        const oldWeaponIndex = this.player.currentWeaponIndex;
        if (this.inputManager.isKeyPressed('1')) {
          this.player.switchWeapon(0);
        } else if (this.inputManager.isKeyPressed('2')) {
          this.player.switchWeapon(1);
        } else if (this.inputManager.isKeyPressed('3')) {
          this.player.switchWeapon(2);
        } else if (this.inputManager.isKeyPressed('4')) {
          this.player.switchWeapon(3);
        }
        
        // Play weapon switch sound if weapon changed
        if (oldWeaponIndex !== this.player.currentWeaponIndex) {
          this.audioManager.playSound('weapon_switch', 0.3);
        }
      }
      
      // Toggle help overlay (H key)
      if (this.inputManager.wasKeyPressed('h') || this.inputManager.wasKeyPressed('H')) {
        this.showHelp = !this.showHelp;
      }
      
      // Toggle inventory (I key)
      if (this.inputManager.wasKeyPressed('i') || this.inputManager.wasKeyPressed('I')) {
        this.showInventory = !this.showInventory;
      }
      
      // Pause
      if (this.inputManager.wasKeyPressed('Escape')) {
        if (this.showInventory) {
          this.showInventory = false; // Close inventory first
        } else {
          this.state = 'paused';
          this.menuState = 'paused';
        }
      }
    } else if (this.state === 'weaponswap') {
      // Weapon swap popup handling
      if (this.inputManager.wasKeyPressed('y') || this.inputManager.wasKeyPressed('Y') || this.inputManager.wasKeyPressed('1')) {
        // YES - Choose which weapon to swap
        this.state = 'weaponswapselect';
      } else if (this.inputManager.wasKeyPressed('n') || this.inputManager.wasKeyPressed('N') || this.inputManager.wasKeyPressed('2') || this.inputManager.wasKeyPressed('Escape')) {
        // NO - Delete the weapon pickup
        if (this.weaponSwapPopup && this.weaponSwapPopup.pickup) {
          this.weaponSwapPopup.pickup.destroy();
        }
        this.weaponSwapPopup = null;
        this.state = 'playing';
      }
    } else if (this.state === 'weaponswapselect') {
      // Choose which weapon slot to replace
      if (this.inputManager.wasKeyPressed('1')) {
        this.swapWeapon(0);
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.swapWeapon(1);
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.swapWeapon(2);
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.swapWeapon(3);
      } else if (this.inputManager.wasKeyPressed('Escape')) {
        // Cancel swap
        this.weaponSwapPopup = null;
        this.state = 'playing';
      }
    } else if (this.state === 'paused') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.state = 'playing';
      } else if (this.inputManager.wasKeyPressed('m') || this.inputManager.wasKeyPressed('M')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.state = 'menu';
        this.menuState = 'main';
        this.audioManager.stopMusic();
        this.audioManager.playMusic('menu');
      } else if (this.inputManager.wasKeyPressed('r') || this.inputManager.wasKeyPressed('R')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, this.selectedCharacter);
      }
    } else if (this.state === 'gameover' || this.state === 'victory') {
      if (this.inputManager.wasKeyPressed('r') || this.inputManager.wasKeyPressed('R')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, this.selectedCharacter);
      } else if (this.inputManager.wasKeyPressed('m') || this.inputManager.wasKeyPressed('M')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.state = 'menu';
        this.menuState = 'main';
        this.audioManager.stopMusic();
        this.audioManager.playMusic('menu');
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
      
      // Play game over music
      this.audioManager.stopMusic();
      this.audioManager.playMusic('gameover');
      
      this.state = 'gameover';
      this.menuState = 'gameover';
      this.ui.setLastScore(this.score);
      return;
    }
    
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player, this.groundLevel, this.currentTime, this.worldWidth);
      
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
    this.enemies = this.enemies.filter(e => e.active && e.health > 0);
    this.projectiles = this.projectiles.filter(p => p.active);
    this.pickups = this.pickups.filter(p => p.active);
    this.covers = this.covers.filter(c => c.active);
    this.platforms = this.platforms.filter(p => p.active);
    this.slopes = this.slopes.filter(s => s.active);
    
    // Also remove from collision system
    this.collisionSystem.entities = this.collisionSystem.entities.filter(e => e.active);
    
    // Check wave/level completion
    this.enemiesRemaining = this.enemies.filter(e => e.active && e.health > 0).length;
    
    if (this.mode === 'survival') {
      if (this.enemiesRemaining === 0) {
        // Wave clear bonus
        const waveBonus = this.wave * 500;
        this.score += waveBonus;
        
        // Play wave complete sound
        this.audioManager.playSound('pickup_powerup', 0.7);
        
        // Reset wave damage tracking
        this.damageTakenThisWave = 0;
        
        this.wave++;
        this.spawnWave();
        this.spawnPickups();
        this.spawnCovers(); // Respawn covers for new wave
      }
    } else if (this.mode === 'campaign') {
      if (this.enemiesRemaining === 0) {
        // Level complete - check if more levels remain
        if (this.currentLevel < this.maxLevel) {
          // Award level completion bonus
          const levelBonus = this.currentLevel * 1000;
          this.score += levelBonus;
          
          // Play level complete sound
          this.audioManager.playSound('pickup_powerup', 0.8);
          
          // Show level complete message briefly
          this.state = 'levelcomplete';
          this.menuState = 'levelcomplete';
          
          // Advance to next level after delay
          setTimeout(() => {
            if (this.state === 'levelcomplete') {
              this.currentLevel++;
              this.enemies = [];
              this.projectiles = [];
              this.pickups = [];
              this.covers = [];
              this.platforms = [];
              this.slopes = [];
              this.spawnCampaignEnemies();
              this.spawnPickups();
              this.spawnCovers();
              this.spawnLevelTerrain();
              this.state = 'playing';
              this.menuState = null;
              
              // Switch music for boss levels
              if (this.isBossLevel) {
                this.audioManager.playMusic('boss');
              } else {
                this.audioManager.playMusic('gameplay');
              }
              
              // Heal player between levels
              this.player.heal(30);
            }
          }, 3000);
        } else {
          // All levels complete - Victory!
          this.finalPlayTime = this.currentTime - this.gameStartTime;
          this.state = 'victory';
          this.menuState = 'victory';
          this.ui.setLastScore(this.score);
          
          // Play victory music
          this.audioManager.stopMusic();
          this.audioManager.playMusic('victory');
        }
      }
    }
  }

  swapWeapon(slotIndex) {
    if (this.weaponSwapPopup && this.player && slotIndex >= 0 && slotIndex < this.player.weapons.length) {
      // Replace weapon in selected slot
      this.player.weapons[slotIndex] = this.weaponSwapPopup.weapon;
      
      // Destroy the pickup
      this.weaponSwapPopup.pickup.destroy();
      
      // Track weapon collection
      this.weaponsCollected++;
      this.score += 50;
      
      // Clear popup
      this.weaponSwapPopup = null;
      this.state = 'playing';
    }
  }

  handleCollisions() {
    // Player vs Cover - make covers solid
    if (this.player && this.player.active) {
      this.covers.forEach(cover => {
        if (cover.active && this.player.collidesWith(cover)) {
          // Calculate overlap and push player out
          const playerBounds = this.player.getBounds();
          const coverBounds = cover.getBounds();
          
          // Calculate overlaps on each side
          const overlapLeft = playerBounds.right - coverBounds.left;
          const overlapRight = coverBounds.right - playerBounds.left;
          const overlapTop = playerBounds.bottom - coverBounds.top;
          const overlapBottom = coverBounds.bottom - playerBounds.top;
          
          // Find minimum overlap (the side with least penetration)
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);
          
          // Push player out on the axis with least overlap
          if (minOverlapX < minOverlapY) {
            // Push horizontally
            if (overlapLeft < overlapRight) {
              this.player.x = coverBounds.left - this.player.width;
            } else {
              this.player.x = coverBounds.right;
            }
            this.player.dx = 0;
          } else {
            // Push vertically
            if (overlapTop < overlapBottom) {
              this.player.y = coverBounds.top - this.player.height;
              this.player.dy = 0;
              this.player.onGround = true;
            } else {
              this.player.y = coverBounds.bottom;
              this.player.dy = 0;
            }
          }
        }
      });
      
      // Player vs Platforms
      this.platforms.forEach(platform => {
        if (platform.active) {
          const playerBounds = this.player.getBounds();
          const platformBounds = platform.getBounds();
          
          // Check if player is falling onto platform from above
          if (this.player.dy >= 0 && 
              playerBounds.bottom <= platformBounds.top + 10 &&
              playerBounds.bottom >= platformBounds.top - 5 &&
              playerBounds.right > platformBounds.left + 5 &&
              playerBounds.left < platformBounds.right - 5) {
            // Land on platform
            this.player.y = platformBounds.top - this.player.height;
            this.player.dy = 0;
            this.player.onGround = true;
          }
          
          // For solid platforms, also block horizontal and upward movement
          if (platform.platformType === 'solid' && this.player.collidesWith(platform)) {
            const overlapLeft = playerBounds.right - platformBounds.left;
            const overlapRight = platformBounds.right - playerBounds.left;
            const overlapTop = playerBounds.bottom - platformBounds.top;
            const overlapBottom = platformBounds.bottom - playerBounds.top;
            
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
            
            // Only apply horizontal collision if not landing from above
            if (minOverlapX < minOverlapY && overlapTop > 10) {
              // Push horizontally
              if (overlapLeft < overlapRight) {
                this.player.x = platformBounds.left - this.player.width;
              } else {
                this.player.x = platformBounds.right;
              }
              this.player.dx = 0;
            } else if (this.player.dy < 0 && overlapBottom < 15) {
              // Bonk head on solid platform from below
              this.player.y = platformBounds.bottom;
              this.player.dy = 0;
            }
          }
        }
      });
      
      // Player vs Slopes
      this.slopes.forEach(slope => {
        if (slope.active) {
          const playerCenterX = this.player.x + this.player.width / 2;
          const playerBottom = this.player.y + this.player.height;
          
          const slopeY = slope.getYAtX(playerCenterX);
          
          if (slopeY !== null && playerBottom >= slopeY - 5 && playerBottom <= slopeY + 10) {
            // Player is on the slope
            this.player.y = slopeY - this.player.height;
            this.player.dy = 0;
            this.player.onGround = true;
          }
        }
      });
    }
    
    // Player vs Pickups
    this.pickups.forEach(pickup => {
      if (pickup.active && this.player && this.player.active && this.player.collidesWith(pickup)) {
        // Check if pickup is temporarily ignored (player said NO to weapon swap)
        if (pickup.ignoredUntil && this.currentTime < pickup.ignoredUntil) {
          return; // Skip this pickup temporarily
        }
        
        // Handle weapon pickups with swap popup
        if (pickup.pickupType && pickup.pickupType.startsWith('weapon_')) {
          // Check if player already has 4 weapons (max capacity)
          if (this.player.weapons.length >= 4) {
            // Show weapon swap popup
            this.weaponSwapPopup = {
              weapon: pickup.weapon,
              pickup: pickup,
              pickupType: pickup.pickupType
            };
            this.state = 'weaponswap';
            return; // Don't apply pickup yet
          } else {
            // Auto-add if not at max capacity
            this.weaponsCollected++;
            pickup.apply(this.player);
            this.score += 50;
            this.audioManager.playSound('pickup_weapon', 0.6);
          }
        } else if (pickup.pickupType === 'health' || pickup.pickupType === 'healing') {
          // Health pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup_health', 0.6);
        } else if (pickup.pickupType === 'ammo') {
          // Ammo pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup_ammo', 0.6);
        } else if (pickup.pickupType && pickup.pickupType.startsWith('powerup_')) {
          // Power-up pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup_powerup', 0.7);
        } else {
          // Generic pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup', 0.6);
        }
      }
    });
    
    // Projectiles vs Enemies/Player
    this.projectiles.forEach(proj => {
      if (!proj.active) return;
      
      // Player projectiles hitting enemies
      if (proj.owner instanceof Weapon && proj.owner === this.player.getCurrentWeapon()) {
        this.enemies.forEach(enemy => {
          if (enemy.active && proj.active && proj.collidesWith(enemy)) {
            const killed = enemy.takeDamage(proj.damage);
            proj.destroy();
            
            // Play hit sound - explosive projectiles get explosion sound
            if (proj.isExplosive) {
              this.audioManager.playSound('explosion', 0.6);
            } else {
              this.audioManager.playSound('enemy_hit', 0.3);
            }
            
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
              
              // Play small explosion on enemy death
              this.audioManager.playSound('explosion', 0.3);
              
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
              // Common drops (60% chance) - basic resources and power-ups
              let pickupTypes = ['health', 'ammo', 'healing', 'damage_boost', 'powerup_speed', 'powerup_rapid_fire'];
              
              // Uncommon power-up drops (25% chance)
              if (Math.random() < 0.25) {
                pickupTypes = ['powerup_multi_shot', 'powerup_invincibility', 'powerup_shield', 'damage_boost'];
              }
              
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
            // Play player hit sound
            this.audioManager.playSound('player_hit', 0.5);
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
    
    // Projectiles vs Cover - bullets stop when hitting cover
    this.projectiles.forEach(proj => {
      if (!proj.active) return;
      
      this.covers.forEach(cover => {
        if (cover.active && proj.collidesWith(cover)) {
          // Destroy projectile when it hits cover
          proj.destroy();
          
          // Play impact sound
          this.audioManager.playSound('projectile_impact', 0.2);
          
          // Damage cover slightly
          const destroyed = cover.takeDamage(proj.damage * 0.1); // Cover takes 10% of bullet damage
          
          // Create small impact effect
          this.particleSystem.createExplosion(
            proj.x,
            proj.y,
            5,
            '#654321'
          );
          
          // If cover is destroyed, create debris
          if (destroyed) {
            this.audioManager.playSound('cover_destroy', 0.5);
            this.particleSystem.createExplosion(
              cover.x + cover.width / 2,
              cover.y + cover.height / 2,
              15,
              '#654321'
            );
          }
        }
      });
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
    
    if (this.state === 'menu' || this.state === 'paused' || this.state === 'gameover' || this.state === 'victory' || this.state === 'levelcomplete' || this.menuState === 'character' || this.menuState === 'settings' || this.menuState === 'controls') {
      // Draw game in background if paused or level complete
      if (this.state === 'paused' || this.state === 'levelcomplete') {
        this.renderGame();
      }
      
      this.ui.drawMenu(this.ctx, this.menuState || this.state);
      return;
    }
    
    if (this.state === 'weaponswap' || this.state === 'weaponswapselect') {
      // Draw game in background
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
      
      // Draw weapon swap popup
      if (this.state === 'weaponswap') {
        this.ui.drawWeaponSwapPopup(this.ctx, this.weaponSwapPopup, this.player);
      } else if (this.state === 'weaponswapselect') {
        this.ui.drawWeaponSwapSelect(this.ctx, this.weaponSwapPopup, this.player);
      }
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
      
      // Draw inventory if open
      if (this.showInventory) {
        this.ui.drawInventory(this.ctx, this.player);
      }
    }
  }

  renderGame() {
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // === 16-BIT ARCADE BACKGROUND ===
    // Layer 1: Sky with 16-bit dithered gradient
    this.draw16BitSky();
    
    // Layer 2: Distant mountains (parallax far)
    this.draw16BitMountains();
    
    // Layer 3: Middle buildings/structures (parallax mid)
    this.draw16BitBuildings();
    
    // Layer 4: Ground with detailed tiles
    this.draw16BitGround();
    
    // Draw slopes first (part of terrain)
    this.slopes.forEach(s => s.render(this.ctx));
    
    // Draw platforms
    this.platforms.forEach(p => p.render(this.ctx));
    
    // Draw cover objects (now as entities)
    this.covers.forEach(c => c.render(this.ctx));
    
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
  
  // 16-bit arcade style sky with dithered gradient
  draw16BitSky() {
    // Base sky colors - classic 16-bit palette
    const skyTop = '#4a5f7f';
    const skyMid = '#6a7f9f';
    const skyBottom = '#8a9fbf';
    
    // Draw gradient bands
    const bandHeight = Math.floor(this.groundLevel / 3);
    this.ctx.fillStyle = skyTop;
    this.ctx.fillRect(0, 0, this.worldWidth, bandHeight);
    this.ctx.fillStyle = skyMid;
    this.ctx.fillRect(0, bandHeight, this.worldWidth, bandHeight);
    this.ctx.fillStyle = skyBottom;
    this.ctx.fillRect(0, bandHeight * 2, this.worldWidth, this.groundLevel - bandHeight * 2);
    
    // Add dithering pattern between bands for 16-bit feel
    this.ctx.fillStyle = skyMid;
    for (let x = 0; x < this.worldWidth; x += 4) {
      for (let y = bandHeight - 8; y < bandHeight + 8; y += 4) {
        if ((x + y) % 8 === 0) {
          this.ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    this.ctx.fillStyle = skyBottom;
    for (let x = 0; x < this.worldWidth; x += 4) {
      for (let y = bandHeight * 2 - 8; y < bandHeight * 2 + 8; y += 4) {
        if ((x + y) % 8 === 0) {
          this.ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    
    // Add clouds (16-bit pixel style)
    const cameraOffset = this.camera.x * 0.1; // Slow parallax
    this.ctx.fillStyle = '#9fb0cf';
    for (let i = 0; i < 8; i++) {
      const cloudX = (i * 400 - cameraOffset) % this.worldWidth;
      const cloudY = 50 + (i % 3) * 40;
      // Pixelated cloud shape
      this.ctx.fillRect(cloudX, cloudY, 48, 8);
      this.ctx.fillRect(cloudX + 8, cloudY - 8, 32, 8);
      this.ctx.fillRect(cloudX + 16, cloudY - 16, 16, 8);
      this.ctx.fillRect(cloudX - 8, cloudY + 8, 64, 8);
    }
  }
  
  // 16-bit arcade style distant mountains
  draw16BitMountains() {
    const cameraOffset = this.camera.x * 0.15; // Parallax effect
    
    // Mountain colors - darker for distance
    const mountainDark = '#2d3d4d';
    const mountainMid = '#3d4d5d';
    const mountainLight = '#4d5d6d';
    
    // Draw multiple mountain layers
    for (let layer = 0; layer < 2; layer++) {
      const baseY = this.groundLevel - 80 - layer * 20;
      const color = layer === 0 ? mountainDark : mountainMid;
      this.ctx.fillStyle = color;
      
      for (let i = 0; i < this.worldWidth / 200; i++) {
        const x = (i * 200 - cameraOffset * (1 + layer * 0.5)) % this.worldWidth;
        const peakHeight = 60 + Math.sin(i * 1.5) * 20;
        
        // Draw pixelated mountain peak
        for (let h = 0; h < peakHeight; h += 4) {
          const width = (peakHeight - h) * 1.5;
          this.ctx.fillRect(x - width / 2, baseY - h, width, 4);
        }
        
        // Add highlights on peaks
        if (layer === 1) {
          this.ctx.fillStyle = mountainLight;
          for (let h = peakHeight - 12; h < peakHeight; h += 4) {
            const width = (peakHeight - h) * 0.7;
            this.ctx.fillRect(x - width / 2, baseY - h, Math.max(4, width / 2), 4);
          }
          this.ctx.fillStyle = color;
        }
      }
    }
  }
  
  // 16-bit arcade style buildings/structures
  draw16BitBuildings() {
    const cameraOffset = this.camera.x * 0.3; // Mid-range parallax
    
    // Building colors
    const buildingBase = '#3a4a3a';
    const buildingDark = '#2a3a2a';
    const buildingWindow = '#5a6a5a';
    const buildingLight = '#4a5a4a';
    
    this.ctx.fillStyle = buildingBase;
    
    for (let i = 0; i < this.worldWidth / 150; i++) {
      const x = (i * 150 - cameraOffset) % this.worldWidth;
      const baseY = this.groundLevel - 40;
      const buildingHeight = 80 + (i % 4) * 20;
      const buildingWidth = 60 + (i % 3) * 20;
      
      // Main building structure
      this.ctx.fillStyle = buildingBase;
      this.ctx.fillRect(x, baseY - buildingHeight, buildingWidth, buildingHeight);
      
      // Building shadow/depth
      this.ctx.fillStyle = buildingDark;
      this.ctx.fillRect(x + buildingWidth - 8, baseY - buildingHeight, 8, buildingHeight);
      
      // Windows (16-bit style grid)
      this.ctx.fillStyle = buildingWindow;
      for (let wy = 0; wy < buildingHeight - 20; wy += 16) {
        for (let wx = 8; wx < buildingWidth - 16; wx += 12) {
          this.ctx.fillRect(x + wx, baseY - buildingHeight + wy + 10, 6, 8);
        }
      }
      
      // Building top detail
      this.ctx.fillStyle = buildingLight;
      this.ctx.fillRect(x, baseY - buildingHeight, buildingWidth, 4);
    }
  }
  
  // 16-bit arcade style ground with detailed tiles
  draw16BitGround() {
    const groundBase = '#4a4a3a';
    const groundDark = '#3a3a2a';
    const groundLight = '#5a5a4a';
    const grassGreen = '#4a5a3a';
    const grassDark = '#3a4a2a';
    
    // Base ground
    this.ctx.fillStyle = groundBase;
    this.ctx.fillRect(0, this.groundLevel, this.worldWidth, this.worldHeight - this.groundLevel);
    
    // Ground tile pattern (16-bit style)
    this.ctx.fillStyle = groundDark;
    for (let x = 0; x < this.worldWidth; x += 32) {
      for (let y = this.groundLevel + 8; y < this.worldHeight; y += 16) {
        // Create brick/tile pattern
        const offset = (Math.floor(y / 16) % 2) * 16;
        this.ctx.fillRect(x + offset, y, 28, 2);
        this.ctx.fillRect(x + offset, y, 2, 14);
      }
    }
    
    // Ground highlights
    this.ctx.fillStyle = groundLight;
    for (let x = 0; x < this.worldWidth; x += 32) {
      for (let y = this.groundLevel + 8; y < this.worldHeight; y += 16) {
        const offset = (Math.floor(y / 16) % 2) * 16;
        if ((x + y) % 64 === 0) {
          this.ctx.fillRect(x + offset + 2, y + 2, 4, 4);
        }
      }
    }
    
    // Top ground detail line
    this.ctx.fillStyle = groundLight;
    this.ctx.fillRect(0, this.groundLevel, this.worldWidth, 2);
    
    // Grass/vegetation on ground edge (pixel style)
    for (let x = 0; x < this.worldWidth; x += 8) {
      const grassHeight = 4 + (Math.sin(x * 0.1) * 2);
      const useGrass = Math.sin(x * 0.3) > -0.5;
      
      if (useGrass) {
        this.ctx.fillStyle = grassGreen;
        // Grass blade
        this.ctx.fillRect(x, this.groundLevel - grassHeight, 3, grassHeight);
        this.ctx.fillRect(x + 1, this.groundLevel - grassHeight - 2, 1, 2);
        
        // Grass shadow
        this.ctx.fillStyle = grassDark;
        this.ctx.fillRect(x + 2, this.groundLevel - grassHeight, 1, grassHeight);
      } else {
        // Small rocks/debris
        this.ctx.fillStyle = groundDark;
        this.ctx.fillRect(x, this.groundLevel - 2, 4, 2);
      }
    }
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
