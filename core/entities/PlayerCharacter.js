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
    
    // Combat - separate ranged and melee weapons
    this.rangedWeapons = [new Pistol()];
    this.currentRangedWeaponIndex = 0;
    this.meleeWeapon = null; // No melee weapon by default
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
        this.specialAbilityCooldown = 12000; // Reduced from 15s to 12s
        this.specialAbilityName = 'Airstrike';
        break;
      case 'scout':
        this.maxHealth = 80;
        this.baseSpeed = 6;
        this.rollCooldown = -200; // Faster roll
        this.specialAbilityCooldown = 8000; // Reduced from 10s to 8s
        this.specialAbilityName = 'Sprint Boost';
        break;
      case 'heavy':
        this.maxHealth = 150;
        this.baseSpeed = 3;
        this.specialAbilityCooldown = 16000; // Reduced from 20s to 16s
        this.specialAbilityName = 'Shield';
        break;
      case 'medic':
        this.maxHealth = 90;
        this.baseSpeed = 4.5;
        this.healRate = 1; // Passive healing
        this.specialAbilityCooldown = 10000; // Reduced from 12s to 10s
        this.specialAbilityName = 'Med Pack';
        break;
    }
    this.health = this.maxHealth;
    this.speed = this.baseSpeed;
  }

  getCurrentWeapon() {
    return this.rangedWeapons[this.currentRangedWeaponIndex];
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.rangedWeapons.length) {
      this.currentRangedWeaponIndex = index;
    }
  }

  addWeapon(weapon) {
    if (weapon.isMelee) {
      // Replace melee weapon
      this.meleeWeapon = weapon;
    } else {
      // Add to ranged weapons if not already present
      if (!this.rangedWeapons.find(w => w.name === weapon.name)) {
        this.rangedWeapons.push(weapon);
      }
    }
  }

  shoot(targetX, targetY, currentTime, isMeleeAttack = false) {
    let weapon;
    
    if (isMeleeAttack) {
      // Use melee weapon if available
      if (!this.meleeWeapon) {
        return null; // No melee weapon equipped
      }
      weapon = this.meleeWeapon;
    } else {
      // Use current ranged weapon
      weapon = this.getCurrentWeapon();
    }
    
    const gunX = this.x + this.width / 2 + (this.facing * 15);
    const gunY = this.y + this.height / 2;
    
    const result = weapon.fire(gunX, gunY, targetX, targetY, currentTime);
    
    // Multi-shot power-up: fire additional projectiles at slight angles (ranged only)
    if (this.hasMultiShot && result && !isMeleeAttack) {
      const projectiles = Array.isArray(result) ? result : [result];
      const additionalProjectiles = [];
      
      projectiles.forEach(proj => {
        // Calculate angle
        const dx = targetX - gunX;
        const dy = targetY - gunY;
        const angle = Math.atan2(dy, dx);
        
        // Create two additional projectiles at +/- 15 degrees
        const angleOffset = Math.PI / 12; // 15 degrees
        
        for (let offset of [-angleOffset, angleOffset]) {
          const newAngle = angle + offset;
          const speed = Math.sqrt(proj.dx * proj.dx + proj.dy * proj.dy);
          const newProj = new Projectile(
            gunX,
            gunY,
            Math.cos(newAngle) * speed,
            Math.sin(newAngle) * speed,
            proj.damage,
            weapon
          );
          newProj.color = proj.color;
          additionalProjectiles.push(newProj);
        }
      });
      
      return [...projectiles, ...additionalProjectiles];
    }
    
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
      this.dx = this.facing * 15; // Increased from 10 to 15 for better sliding
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
        // Airstrike: Drop bombs on enemies
        if (gameEngine) {
          // Capture enemy positions immediately to avoid issues with forEach closures
          const enemyTargets = [];
          gameEngine.enemies.forEach((enemy, index) => {
            if (enemy.active && enemy.health > 0) {
              enemyTargets.push({
                enemy: enemy,
                bombX: enemy.x + enemy.width / 2,
                bombY: -50,
                targetY: enemy.y + enemy.height / 2,
                delay: index * 100
              });
            }
          });
          
          // Create bombs for each target
          enemyTargets.forEach((target) => {
            gameEngine.particleSystem.createBombDrop(target.bombX, target.bombY, target.targetY, target.delay);
            
            // Schedule damage using a safer approach
            const damageTimeout = setTimeout(() => {
              if (target.enemy && target.enemy.active && target.enemy.health > 0) {
                target.enemy.takeDamage(40);
              }
              clearTimeout(damageTimeout);
            }, target.delay + 800);
          });
        }
        const abilityTimeout = setTimeout(() => { 
          this.specialAbilityActive = false;
          clearTimeout(abilityTimeout);
        }, 2000);
        return 'airstrike';
        
      case 'scout':
        // Sprint Boost: Increased speed for 6 seconds (increased from 5s and more speed)
        const originalSpeed = this.speed;
        this.speed = originalSpeed * 2; // Increased from 1.5x to 2x
        setTimeout(() => {
          if (this.active) {
            this.speed = originalSpeed;
            this.specialAbilityActive = false;
          }
        }, 6000); // Increased from 5000 to 6000
        return 'sprint';
        
      case 'heavy':
        // Shield: Invulnerability for 3.5 seconds (increased from 2.5s)
        this.invulnerable = true;
        setTimeout(() => {
          if (this.active) {
            this.invulnerable = false;
            this.specialAbilityActive = false;
          }
        }, 3500); // Increased from 2500 to 3500
        return 'shield';
        
      case 'medic':
        // Med Pack: Restore 60 HP (increased from 40)
        this.heal(60);
        setTimeout(() => { this.specialAbilityActive = false; }, 500);
        return 'medpack';
    }
    
    return null;
  }

  takeDamage(amount) {
    if (!this.invulnerable) {
      // Check if player has shield power-up
      if (this.hasShield && this.shieldHealth > 0) {
        this.shieldHealth -= amount;
        if (this.shieldHealth <= 0) {
          // Shield depleted, apply overflow damage to health
          const overflow = Math.abs(this.shieldHealth);
          this.shieldHealth = 0;
          this.hasShield = false;
          this.health -= overflow;
        }
      } else {
        this.health -= amount;
      }
      
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
    
    // Update ranged weapon
    this.getCurrentWeapon().update(currentTime);
    
    // Update melee weapon if equipped
    if (this.meleeWeapon) {
      this.meleeWeapon.update(currentTime);
    }
    
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
    // Draw shadow (16-bit style)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(this.x + 2, this.y + this.height, this.width - 4, 4);
    
    // Draw shield aura
    if (this.hasShield && this.shieldHealth > 0) {
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#00aaff';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.globalAlpha = 1;
    }
    
    // Draw damage boost aura
    if (this.hasDamageBoost) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
      ctx.globalAlpha = 1;
    }
    
    // Draw rapid fire aura
    if (this.hasRapidFire) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
      ctx.globalAlpha = 1;
    }
    
    // Draw multi-shot indicator
    if (this.hasMultiShot) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
      ctx.globalAlpha = 1;
    }
    
    // Draw player
    if (this.invulnerable) {
      ctx.globalAlpha = 0.5;
    }
    
    // 16-bit arcade character colors based on type
    let bodyColor, bodyLight, bodyDark, helmetColor, helmetLight, armorColor;
    switch (this.characterType) {
      case 'soldier':
        bodyColor = '#5a7a4a'; // Olive green
        bodyLight = '#6a8a5a';
        bodyDark = '#4a6a3a';
        helmetColor = '#3a5731';
        helmetLight = '#4a6741';
        armorColor = '#2a4721';
        break;
      case 'scout':
        bodyColor = '#6b7c5a'; // Light olive
        bodyLight = '#7b8c6a';
        bodyDark = '#5b6c4a';
        helmetColor = '#5b6c4a';
        helmetLight = '#6b7c5a';
        armorColor = '#4b5c3a';
        break;
      case 'heavy':
        bodyColor = '#4a4a4a'; // Dark gray
        bodyLight = '#5a5a5a';
        bodyDark = '#3a3a3a';
        helmetColor = '#2a2a2a';
        helmetLight = '#3a3a3a';
        armorColor = '#1a1a1a';
        break;
      case 'medic':
        bodyColor = '#5a6b7c'; // Blue-gray
        bodyLight = '#6a7b8c';
        bodyDark = '#4a5b6c';
        helmetColor = '#4a5b6c';
        helmetLight = '#5a6b7c';
        armorColor = '#3a4b5c';
        break;
      default:
        bodyColor = '#5a7a4a';
        bodyLight = '#6a8a5a';
        bodyDark = '#4a6a3a';
        helmetColor = '#3a5731';
        helmetLight = '#4a6741';
        armorColor = '#2a4721';
    }
    
    // === 16-BIT CHARACTER SPRITE ===
    
    // Main body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x + 8, this.y + 18, this.width - 16, this.height - 28);
    
    // Body highlights (16-bit shading)
    ctx.fillStyle = bodyLight;
    ctx.fillRect(this.x + 8, this.y + 18, 4, this.height - 28);
    ctx.fillRect(this.x + 8, this.y + 18, this.width - 16, 4);
    
    // Body shadows
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + this.width - 12, this.y + 18, 4, this.height - 28);
    ctx.fillRect(this.x + 8, this.y + this.height - 14, this.width - 16, 4);
    
    // Helmet/Head (16-bit detailed)
    ctx.fillStyle = helmetColor;
    ctx.fillRect(this.x + 6, this.y + 4, this.width - 12, 16);
    
    // Helmet highlights
    ctx.fillStyle = helmetLight;
    ctx.fillRect(this.x + 6, this.y + 4, this.width - 12, 4);
    ctx.fillRect(this.x + 6, this.y + 4, 4, 16);
    
    // Visor/Face (16-bit style)
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, 6);
    
    // Visor reflection
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(this.x + 10, this.y + 10, 4, 2);
    
    // Armor plates/chest detail
    ctx.fillStyle = armorColor;
    ctx.fillRect(this.x + 10, this.y + 22, this.width - 20, 8);
    ctx.fillRect(this.x + 12, this.y + 32, this.width - 24, 4);
    
    // Armor highlights
    ctx.fillStyle = bodyLight;
    ctx.fillRect(this.x + 10, this.y + 22, 2, 8);
    
    // Belt/waist detail
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(this.x + 10, this.y + 38, this.width - 20, 3);
    
    // Legs (16-bit pixel style)
    const legWidth = 7;
    const legSpacing = 2;
    
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
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(this.x + 7, this.y + this.height - 5, legWidth + 1, 5);
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 5, legWidth + 1, 5);
    
    // === WEAPON (16-bit detailed) ===
    const weaponX = this.x + this.width / 2 + (this.facing * 12);
    const weaponY = this.y + this.height / 2 - 2;
    
    // Weapon body
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(weaponX, weaponY - 4, 18 * this.facing, 8);
    
    // Weapon highlights
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(weaponX, weaponY - 4, 18 * this.facing, 2);
    
    // Weapon barrel
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(weaponX + (12 * this.facing), weaponY - 3, 6 * this.facing, 6);
    
    // Barrel opening
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(weaponX + (16 * this.facing), weaponY - 1, 2 * this.facing, 2);
    
    // Magazine/clip
    ctx.fillStyle = '#3a3a2a';
    ctx.fillRect(weaponX + (4 * this.facing), weaponY + 4, 6 * this.facing, 6);
    
    // Grip detail
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(weaponX, weaponY + 2, 4 * this.facing, 4);
    
    // Character outline for visibility (16-bit style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 6, this.y + 4, this.width - 12, this.height - 4);
    
    ctx.globalAlpha = 1;
    
    // === HEALTH BAR (16-bit arcade style) ===
    const barWidth = this.width;
    const barHeight = 5;
    const healthPercent = this.health / this.maxHealth;
    
    // Health bar background
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x - 1, this.y - 12, barWidth + 2, barHeight + 2);
    
    // Health bar empty portion
    ctx.fillStyle = '#660000';
    ctx.fillRect(this.x, this.y - 11, barWidth, barHeight);
    
    // Health bar fill (16-bit color-coded)
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(this.x, this.y - 11, barWidth * healthPercent, barHeight);
    
    // Health bar highlights (16-bit style)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(this.x, this.y - 11, barWidth * healthPercent, 2);
  }
}
