// Enhanced Player with multiple characters and abilities
class PlayerCharacter extends Entity {
  constructor(x, y, characterType = 'soldier') {
    super(x, y, 30, 50);
    
    this.type = 'player';
    this.characterType = characterType;
    
    // Stats
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.baseSpeed = 4;
    this.speed = this.baseSpeed;
    this.jumpStrength = -12;
    
    // Physics
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.6;
    this.onGround = false;
    this.facing = 1; // 1 = right, -1 = left
    
    // Combat
    this.weapons = [new Pistol()];
    this.currentWeaponIndex = 0;
    this.score = 0;
    this.kills = 0;
    
    // States
    this.state = 'idle'; // idle, running, jumping, crouching, rolling
    this.isCrouching = false;
    this.isRolling = false;
    this.rollTime = 0;
    this.rollDuration = 400;
    this.rollCooldown = 0;
    this.invulnerable = false;
    
    // Special ability system
    this.specialAbilityCooldown = 0;
    this.specialAbilityDuration = 0;
    this.specialAbilityActive = false;
    this.lastSpecialUse = 0;
    
    // Character-specific attributes
    this.applyCharacterTraits();
    
    // Visual
    this.color = '#0066ff';
  }

  applyCharacterTraits() {
    switch (this.characterType) {
      case 'soldier':
        this.maxHealth = 100;
        this.baseSpeed = 4;
        this.specialAbilityCooldown = 15000; // 15 seconds
        this.specialAbilityName = 'Airstrike';
        break;
      case 'scout':
        this.maxHealth = 80;
        this.baseSpeed = 6;
        this.rollCooldown = -200; // Faster roll
        this.specialAbilityCooldown = 10000; // 10 seconds
        this.specialAbilityName = 'Sprint Boost';
        break;
      case 'heavy':
        this.maxHealth = 150;
        this.baseSpeed = 3;
        this.specialAbilityCooldown = 20000; // 20 seconds
        this.specialAbilityName = 'Shield';
        break;
      case 'medic':
        this.maxHealth = 90;
        this.baseSpeed = 4.5;
        this.healRate = 1; // Passive healing
        this.specialAbilityCooldown = 12000; // 12 seconds
        this.specialAbilityName = 'Med Pack';
        break;
    }
    this.health = this.maxHealth;
    this.speed = this.baseSpeed;
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  addWeapon(weapon) {
    if (!this.weapons.find(w => w.name === weapon.name)) {
      this.weapons.push(weapon);
    }
  }

  shoot(targetX, targetY, currentTime) {
    const weapon = this.getCurrentWeapon();
    const gunX = this.x + this.width / 2 + (this.facing * 15);
    const gunY = this.y + this.height / 2;
    
    const result = weapon.fire(gunX, gunY, targetX, targetY, currentTime);
    return result;
  }

  reload(currentTime) {
    this.getCurrentWeapon().reload(currentTime);
  }

  crouch() {
    if (!this.isCrouching && this.onGround) {
      this.isCrouching = true;
      this.height = 30;
      this.speed = 2;
    }
  }

  stand() {
    if (this.isCrouching) {
      this.isCrouching = false;
      this.height = 50;
      this.speed = this.baseSpeed;
    }
  }

  roll(currentTime) {
    if (this.onGround && !this.isRolling && currentTime - this.rollTime > this.rollDuration + this.rollCooldown + 800) {
      this.isRolling = true;
      this.rollTime = currentTime;
      this.invulnerable = true;
      this.dx = this.facing * 10;
    }
  }
  
  useSpecialAbility(currentTime, gameEngine) {
    if (currentTime - this.lastSpecialUse < this.specialAbilityCooldown) {
      return null; // Still on cooldown
    }
    
    this.lastSpecialUse = currentTime;
    this.specialAbilityActive = true;
    
    switch (this.characterType) {
      case 'soldier':
        // Airstrike: Damage all enemies on screen (reduced damage for balance)
        if (gameEngine) {
          gameEngine.enemies.forEach(enemy => {
            if (enemy.active) {
              enemy.takeDamage(30); // Reduced from 50 to 30
              gameEngine.particleSystem.createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2,
                15,
                '#ff8800'
              );
            }
          });
        }
        setTimeout(() => { this.specialAbilityActive = false; }, 1000);
        return 'airstrike';
        
      case 'scout':
        // Sprint Boost: Increased speed for 5 seconds (balanced)
        const originalSpeed = this.speed;
        this.speed = originalSpeed * 1.5; // Reduced from 2x to 1.5x
        setTimeout(() => {
          if (this.active) {
            this.speed = originalSpeed;
            this.specialAbilityActive = false;
          }
        }, 5000);
        return 'sprint';
        
      case 'heavy':
        // Shield: Invulnerability for 2.5 seconds (reduced from 3)
        this.invulnerable = true;
        setTimeout(() => {
          if (this.active) {
            this.invulnerable = false;
            this.specialAbilityActive = false;
          }
        }, 2500); // Reduced from 3000 to 2500
        return 'shield';
        
      case 'medic':
        // Med Pack: Restore 40 HP (reduced from 50)
        this.heal(40);
        setTimeout(() => { this.specialAbilityActive = false; }, 500);
        return 'medpack';
    }
    
    return null;
  }

  takeDamage(amount) {
    if (!this.invulnerable) {
      this.health -= amount;
      if (this.health <= 0) {
        this.health = 0;
        this.destroy();
      }
      return true;
    }
    return false;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  update(deltaTime, inputManager, groundLevel, currentTime, worldWidth) {
    const dt = deltaTime / 16;
    
    // Update weapon
    this.getCurrentWeapon().update(currentTime);
    
    // Handle rolling
    if (this.isRolling) {
      if (currentTime - this.rollTime > this.rollDuration) {
        this.isRolling = false;
        this.invulnerable = false;
        this.dx *= 0.5;
      }
    }
    
    // Movement (disabled while rolling)
    if (!this.isRolling) {
      this.dx = 0;
      
      if (inputManager.isKeyPressed('ArrowLeft') || inputManager.isKeyPressed('a')) {
        this.dx = -this.speed;
        this.facing = -1;
        this.state = 'running';
      } else if (inputManager.isKeyPressed('ArrowRight') || inputManager.isKeyPressed('d')) {
        this.dx = this.speed;
        this.facing = 1;
        this.state = 'running';
      } else if (this.onGround) {
        this.state = 'idle';
      }
      
      // Crouching
      if (inputManager.isKeyPressed('ArrowDown') || inputManager.isKeyPressed('s')) {
        this.crouch();
      } else {
        this.stand();
      }
    }
    
    // Apply movement
    this.x += this.dx * dt;
    
    // Clamp to world bounds
    if (worldWidth) {
      this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));
    }
    
    // Apply gravity
    this.dy += this.gravity * dt;
    this.y += this.dy * dt;
    
    // Ground collision
    if (this.y + this.height >= groundLevel) {
      this.y = groundLevel - this.height;
      this.dy = 0;
      this.onGround = true;
      if (this.state === 'jumping') {
        this.state = 'idle';
      }
    } else {
      this.onGround = false;
    }
    
    // Character-specific passive abilities
    if (this.characterType === 'medic' && this.health < this.maxHealth) {
      this.heal(0.05 * dt);
    }
  }

  render(ctx) {
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x, this.y + this.height, this.width, 5);
    
    // Draw damage boost aura
    if (this.hasDamageBoost) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
      ctx.globalAlpha = 1;
    }
    
    // Draw player
    if (this.invulnerable) {
      ctx.globalAlpha = 0.5;
    }
    
    // Military character colors based on type
    let bodyColor, helmetColor;
    switch (this.characterType) {
      case 'soldier':
        bodyColor = '#4a6741'; // Olive green
        helmetColor = '#3a5731';
        break;
      case 'scout':
        bodyColor = '#6b7c5a'; // Light olive
        helmetColor = '#5b6c4a';
        break;
      case 'heavy':
        bodyColor = '#3a3a3a'; // Dark gray
        helmetColor = '#2a2a2a';
        break;
      case 'medic':
        bodyColor = '#5a6b7c'; // Blue-gray
        helmetColor = '#4a5b6c';
        break;
      default:
        bodyColor = '#4a6741';
        helmetColor = '#3a5731';
    }
    
    // Draw body (retro style - simple rectangles)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw helmet/head
    ctx.fillStyle = helmetColor;
    ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 15);
    
    // Draw legs (simple rectangles)
    ctx.fillStyle = bodyColor;
    const legWidth = 8;
    ctx.fillRect(this.x + 5, this.y + this.height - 15, legWidth, 15);
    ctx.fillRect(this.x + this.width - 5 - legWidth, this.y + this.height - 15, legWidth, 15);
    
    // Draw weapon indicator (more prominent)
    ctx.fillStyle = '#1a1a1a';
    const weaponX = this.x + this.width / 2 + (this.facing * 15);
    const weaponY = this.y + this.height / 2;
    ctx.fillRect(weaponX, weaponY - 3, 15 * this.facing, 6);
    
    // Weapon barrel detail
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(weaponX + (10 * this.facing), weaponY - 1, 5 * this.facing, 2);
    
    ctx.globalAlpha = 1;
    
    // Draw health bar (military style)
    const barWidth = this.width;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
    
    // Health bar color based on health percentage
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
    
    // Health bar border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y - 10, barWidth, barHeight);
  }
}
