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
        break;
    }
    this.health = this.maxHealth;
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
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x, this.y + this.height, this.width, 5);
    
    // Draw enemy
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw weapon
    ctx.fillStyle = '#222';
    const weaponX = this.x + this.width / 2 + (this.facing * 10);
    const weaponY = this.y + this.height / 2;
    ctx.fillRect(weaponX, weaponY - 2, 10 * this.facing, 4);
    
    // Draw health bar
    const barWidth = this.width;
    const barHeight = 3;
    const healthPercent = this.health / this.maxHealth;
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
    
    // Draw AI state indicator (debug)
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.fillText(this.aiState.substring(0, 3), this.x, this.y - 12);
  }
}
