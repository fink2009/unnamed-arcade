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
        break;
      case 'scout':
        this.maxHealth = 80;
        this.baseSpeed = 6;
        this.rollCooldown = -200; // Faster roll
        break;
      case 'heavy':
        this.maxHealth = 150;
        this.baseSpeed = 3;
        break;
      case 'medic':
        this.maxHealth = 90;
        this.baseSpeed = 4.5;
        this.healRate = 1; // Passive healing
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
    
    // Draw player
    if (this.invulnerable) {
      ctx.globalAlpha = 0.5;
    }
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw weapon indicator
    ctx.fillStyle = '#333';
    const weaponX = this.x + this.width / 2 + (this.facing * 15);
    const weaponY = this.y + this.height / 2;
    ctx.fillRect(weaponX, weaponY - 2, 12 * this.facing, 4);
    
    ctx.globalAlpha = 1;
    
    // Draw health bar
    const barWidth = this.width;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
  }
}
