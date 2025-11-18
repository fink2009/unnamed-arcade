// AI Behavior states
const AIState = {
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  HIDE: 'hide',
  FLANK: 'flank',
  RETREAT: 'retreat'
};

// Base Enemy class with advanced AI
class EnemyUnit extends Entity {
  constructor(x, y, enemyType = 'infantry') {
    super(x, y, 28, 48);
    
    this.type = 'enemy';
    this.enemyType = enemyType;
    
    // Stats
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.speed = 2;
    this.damage = 10;
    
    // AI
    this.aiState = AIState.PATROL;
    this.aggroRange = 400;
    this.attackRange = 300;
    this.retreatThreshold = 0.3;
    this.target = null;
    this.lastStateChange = 0;
    this.stateTimer = 0;
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.6;
    this.facing = -1;
    this.patrolDirection = -1;
    this.patrolMin = x - 100;
    this.patrolMax = x + 100;
    
    // Combat
    this.weapon = new Pistol();
    this.lastShotTime = 0;
    this.shootCooldown = 1000;
    
    // Visual
    this.color = '#ff3333';
    
    this.applyEnemyType();
  }

  applyEnemyType() {
    switch (this.enemyType) {
      case 'infantry':
        this.maxHealth = 50;
        this.speed = 2;
        this.weapon = new Pistol();
        break;
      case 'heavy':
        this.maxHealth = 100;
        this.speed = 1.5;
        this.weapon = new MachineGun();
        this.color = '#cc0000';
        this.width = 32;
        this.height = 52;
        break;
      case 'sniper':
        this.maxHealth = 40;
        this.speed = 1.8;
        this.weapon = new SniperRifle();
        this.attackRange = 600;
        this.color = '#660000';
        break;
      case 'scout':
        this.maxHealth = 30;
        this.speed = 3.5;
        this.weapon = new Pistol();
        this.color = '#ff6666';
        this.width = 24;
        this.height = 44;
        break;
      case 'boss':
        this.maxHealth = 500;
        this.speed = 1;
        this.weapon = new MachineGun();
        this.attackRange = 500;
        this.color = '#990000';
        this.width = 50;
        this.height = 70;
        this.aggroRange = 600;
        this.shootCooldown = 500; // Faster shooting
        break;
    }
    this.health = this.maxHealth;
  }

  applyDifficulty(multiplier) {
    this.maxHealth = Math.floor(this.maxHealth * multiplier);
    this.health = this.maxHealth;
    this.speed *= multiplier;
    this.damage = Math.floor(this.damage * multiplier);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true;
    }
    
    // React to damage
    if (this.health < this.maxHealth * this.retreatThreshold) {
      this.aiState = AIState.RETREAT;
    } else {
      this.aiState = AIState.CHASE;
    }
    return false;
  }

  updateAI(player, currentTime, deltaTime) {
    if (!player || !player.active) return;
    
    const distToPlayer = this.distanceTo(player);
    this.target = player;
    
    // State machine
    this.stateTimer += deltaTime;
    
    switch (this.aiState) {
      case AIState.PATROL:
        this.patrol();
        if (distToPlayer < this.aggroRange) {
          this.changeState(AIState.CHASE, currentTime);
        }
        break;
        
      case AIState.CHASE:
        this.chase(player);
        if (distToPlayer < this.attackRange) {
          this.changeState(AIState.ATTACK, currentTime);
        } else if (distToPlayer > this.aggroRange * 1.5) {
          this.changeState(AIState.PATROL, currentTime);
        }
        // Randomly decide to flank
        if (this.stateTimer > 3000 && Math.random() < 0.3) {
          this.changeState(AIState.FLANK, currentTime);
        }
        break;
        
      case AIState.ATTACK:
        this.attack(player, currentTime);
        if (distToPlayer > this.attackRange * 1.2) {
          this.changeState(AIState.CHASE, currentTime);
        }
        // Randomly decide to hide
        if (this.stateTimer > 2000 && Math.random() < 0.2) {
          this.changeState(AIState.HIDE, currentTime);
        }
        break;
        
      case AIState.FLANK:
        this.flank(player);
        if (this.stateTimer > 4000 || distToPlayer < this.attackRange) {
          this.changeState(AIState.ATTACK, currentTime);
        }
        break;
        
      case AIState.HIDE:
        this.hide(player);
        if (this.stateTimer > 2000) {
          this.changeState(AIState.ATTACK, currentTime);
        }
        break;
        
      case AIState.RETREAT:
        this.retreat(player);
        if (distToPlayer > this.aggroRange) {
          this.changeState(AIState.PATROL, currentTime);
        }
        break;
    }
  }

  changeState(newState, currentTime) {
    this.aiState = newState;
    this.lastStateChange = currentTime;
    this.stateTimer = 0;
  }

  patrol() {
    this.dx = this.patrolDirection * this.speed * 0.5;
    
    if (this.x <= this.patrolMin) {
      this.patrolDirection = 1;
      this.facing = 1;
    } else if (this.x >= this.patrolMax) {
      this.patrolDirection = -1;
      this.facing = -1;
    }
  }

  chase(player) {
    if (this.x < player.x) {
      this.dx = this.speed;
      this.facing = 1;
    } else {
      this.dx = -this.speed;
      this.facing = -1;
    }
  }

  attack(player, currentTime) {
    // Stop moving and shoot
    this.dx = 0;
    this.facing = player.x > this.x ? 1 : -1;
    
    if (currentTime - this.lastShotTime > this.shootCooldown) {
      this.lastShotTime = currentTime;
      return this.shoot(player.x + player.width / 2, player.y + player.height / 2, currentTime);
    }
    return null;
  }

  flank(player) {
    // Try to move perpendicular to player
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const flankAngle = angle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
    this.dx = Math.cos(flankAngle) * this.speed * 1.2;
    this.facing = this.dx > 0 ? 1 : -1;
  }

  hide(player) {
    // Move away from player slowly
    if (this.x < player.x) {
      this.dx = -this.speed * 0.5;
      this.facing = -1;
    } else {
      this.dx = this.speed * 0.5;
      this.facing = 1;
    }
  }

  retreat(player) {
    // Move away from player quickly
    if (this.x < player.x) {
      this.dx = -this.speed * 1.5;
      this.facing = -1;
    } else {
      this.dx = this.speed * 1.5;
      this.facing = 1;
    }
  }

  shoot(targetX, targetY, currentTime) {
    const gunX = this.x + this.width / 2 + (this.facing * 10);
    const gunY = this.y + this.height / 2;
    return this.weapon.fire(gunX, gunY, targetX, targetY, currentTime);
  }

  distanceTo(entity) {
    const dx = (entity.x + entity.width / 2) - (this.x + this.width / 2);
    const dy = (entity.y + entity.height / 2) - (this.y + this.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  update(deltaTime, player, groundLevel, currentTime) {
    const dt = deltaTime / 16;
    
    // Update weapon
    this.weapon.update(currentTime);
    
    // AI decision making
    this.updateAI(player, currentTime, deltaTime);
    
    // Apply movement
    this.x += this.dx * dt;
    
    // Apply gravity
    this.dy += this.gravity * dt;
    this.y += this.dy * dt;
    
    // Ground collision
    if (this.y + this.height >= groundLevel) {
      this.y = groundLevel - this.height;
      this.dy = 0;
    }
  }

  render(ctx) {
    // Draw shadow (16-bit style)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(this.x + 2, this.y + this.height, this.width - 4, 4);
    
    // 16-bit arcade enemy colors based on type
    let bodyColor, bodyLight, bodyDark, helmetColor, helmetLight, armorColor;
    switch (this.enemyType) {
      case 'infantry':
        bodyColor = '#8b5a2a'; // Brown
        bodyLight = '#9b6a3a';
        bodyDark = '#7b4a1a';
        helmetColor = '#6b3a10';
        helmetLight = '#7b4a20';
        armorColor = '#5b2a00';
        break;
      case 'heavy':
        bodyColor = '#5a5a5a'; // Dark gray
        bodyLight = '#6a6a6a';
        bodyDark = '#4a4a4a';
        helmetColor = '#3a3a3a';
        helmetLight = '#4a4a4a';
        armorColor = '#2a2a2a';
        break;
      case 'sniper':
        bodyColor = '#3d5a3d'; // Dark green
        bodyLight = '#4d6a4d';
        bodyDark = '#2d4a2d';
        helmetColor = '#2d4a2d';
        helmetLight = '#3d5a3d';
        armorColor = '#1d3a1d';
        break;
      case 'scout':
        bodyColor = '#9b6a3a'; // Light brown
        bodyLight = '#ab7a4a';
        bodyDark = '#8b5a2a';
        helmetColor = '#7b4a20';
        helmetLight = '#8b5a30';
        armorColor = '#6b3a10';
        break;
      case 'boss':
        bodyColor = '#8a0a0a'; // Blood red
        bodyLight = '#aa2a2a';
        bodyDark = '#5a0000';
        helmetColor = '#3a0000';
        helmetLight = '#5a0a0a';
        armorColor = '#2a0000';
        break;
      default:
        bodyColor = '#8b5a2a';
        bodyLight = '#9b6a3a';
        bodyDark = '#7b4a1a';
        helmetColor = '#6b3a10';
        helmetLight = '#7b4a20';
        armorColor = '#5b2a00';
    }
    
    // Scale for boss - make them more imposing
    const scale = this.enemyType === 'boss' ? 1.6 : 1.0;
    const offsetY = this.enemyType === 'boss' ? -15 : 0;
    
    // Boss intimidation aura
    if (this.enemyType === 'boss') {
      const pulseIntensity = this.isFinalBoss ? 0.4 : 0.3;
      ctx.globalAlpha = pulseIntensity + Math.sin(Date.now() / 200) * 0.15;
      ctx.fillStyle = this.isFinalBoss ? '#ff00ff' : '#ff0000'; // Purple for final boss
      ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
      
      // Extra intimidation for final boss
      if (this.isFinalBoss) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 15, this.y - 15, this.width + 30, this.height + 30);
      }
      ctx.globalAlpha = 1;
    }
    
    // === 16-BIT ENEMY SPRITE ===
    
    // Main body
    ctx.fillStyle = bodyColor;
    const bodyWidth = Math.floor((this.width - 16) * scale);
    const bodyHeight = Math.floor((this.height - 28) * scale);
    ctx.fillRect(this.x + 8, this.y + 18 + offsetY, bodyWidth, bodyHeight);
    
    // Body shadows (16-bit shading)
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 8, this.y + 18 + offsetY, 4, bodyHeight);
    ctx.fillRect(this.x + 8, this.y + bodyHeight + 14 + offsetY, bodyWidth, 4);
    
    // Body highlights
    ctx.fillStyle = bodyLight;
    ctx.fillRect(this.x + bodyWidth + 4, this.y + 18 + offsetY, 4, bodyHeight);
    ctx.fillRect(this.x + 8, this.y + 18 + offsetY, bodyWidth, 4);
    
    // Helmet/Head (16-bit detailed)
    const headWidth = Math.floor((this.width - 12) * scale);
    ctx.fillStyle = helmetColor;
    ctx.fillRect(this.x + 6, this.y + 4 + offsetY, headWidth, Math.floor(16 * scale));
    
    // Helmet shadow
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 6, this.y + 4 + offsetY, 4, Math.floor(16 * scale));
    
    // Visor/Face (16-bit menacing style)
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(this.x + 10, this.y + 10 + offsetY, headWidth - 8, 6);
    
    // Visor glow (enemy red eyes)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x + 12, this.y + 12 + offsetY, 3, 2);
    ctx.fillRect(this.x + headWidth - 8, this.y + 12 + offsetY, 3, 2);
    
    // Armor plates/chest detail
    ctx.fillStyle = armorColor;
    ctx.fillRect(this.x + 10, this.y + 22 + offsetY, bodyWidth - 4, Math.floor(8 * scale));
    if (this.enemyType === 'heavy' || this.enemyType === 'boss') {
      ctx.fillRect(this.x + 12, this.y + 32 + offsetY, bodyWidth - 8, Math.floor(6 * scale));
    }
    
    // Boss-specific menacing armor spikes
    if (this.enemyType === 'boss') {
      ctx.fillStyle = '#aa0000';
      // Shoulder spikes
      for (let i = 0; i < 3; i++) {
        const spikeX = this.x + 8 + i * 6;
        const spikeY = this.y + 20 + offsetY;
        ctx.fillRect(spikeX, spikeY - 6, 4, 6);
        ctx.fillRect(spikeX + 1, spikeY - 8, 2, 2);
      }
      for (let i = 0; i < 3; i++) {
        const spikeX = this.x + this.width - 20 + i * 6;
        const spikeY = this.y + 20 + offsetY;
        ctx.fillRect(spikeX, spikeY - 6, 4, 6);
        ctx.fillRect(spikeX + 1, spikeY - 8, 2, 2);
      }
      
      // Chest emblem (skull-like)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x + bodyWidth / 2 - 4, this.y + 28 + offsetY, 8, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(this.x + bodyWidth / 2 - 2, this.y + 29 + offsetY, 2, 2);
      ctx.fillRect(this.x + bodyWidth / 2 + 2, this.y + 29 + offsetY, 2, 2);
    }
    
    // Belt/waist detail
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(this.x + 10, this.y + Math.floor(38 * scale) + offsetY, bodyWidth - 4, 3);
    
    // Legs (16-bit pixel style)
    const legWidth = Math.floor(7 * scale);
    
    // Left leg
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 8, this.y + this.height - 12, legWidth, 12);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x + 8, this.y + this.height - 12, legWidth - 2, 12);
    
    // Right leg
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 12, legWidth, 12);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 12, legWidth - 2, 12);
    
    // Boots
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(this.x + 7, this.y + this.height - 5, legWidth + 1, 5);
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 5, legWidth + 1, 5);
    
    // === WEAPON (16-bit enemy weapon) ===
    const weaponX = this.x + this.width / 2 + (this.facing * 10);
    const weaponY = this.y + this.height / 2;
    
    // Weapon body
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(weaponX, weaponY - 3, 14 * this.facing, 6);
    
    // Weapon highlights
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(weaponX, weaponY - 3, 14 * this.facing, 2);
    
    // Weapon barrel
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(weaponX + (10 * this.facing), weaponY - 2, 4 * this.facing, 4);
    
    // Character outline for visibility (16-bit style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 6, this.y + 4 + offsetY, this.width - 12, this.height - 4);
    
    // === HEALTH BAR (16-bit arcade style) ===
    const barWidth = this.width;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    
    // Health bar background
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x - 1, this.y - 10, barWidth + 2, barHeight + 2);
    
    // Health bar empty
    ctx.fillStyle = '#660000';
    ctx.fillRect(this.x, this.y - 9, barWidth, barHeight);
    
    // Health bar fill (enemy red theme)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(this.x, this.y - 9, barWidth * healthPercent, barHeight);
    
    // Health bar highlight
    ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
    ctx.fillRect(this.x, this.y - 9, barWidth * healthPercent, 1);
    
    // Draw AI state indicator (16-bit retro style)
    ctx.fillStyle = '#ffff00';
    ctx.font = '8px monospace';
    ctx.fillText(this.aiState.substring(0, 3).toUpperCase(), this.x, this.y - 13);
  }
}
