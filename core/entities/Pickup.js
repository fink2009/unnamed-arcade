// Power-up and pickup system
class Pickup extends Entity {
  constructor(x, y, pickupType) {
    super(x, y, 20, 20);
    this.type = 'pickup';
    this.pickupType = pickupType;
    this.bobOffset = 0;
    this.bobSpeed = 0.05;
    
    switch (pickupType) {
      case 'health':
        this.color = '#00ff00';
        this.value = 30;
        break;
      case 'ammo':
        this.color = '#ffff00';
        this.value = 50;
        break;
      case 'damage_boost':
        this.color = '#ff0000';
        this.duration = 10000; // 10 seconds
        this.damageMultiplier = 1.5;
        break;
      case 'healing':
        this.color = '#00ffaa';
        this.value = 15; // Smaller heal for procedural drops
        break;
      case 'weapon_rifle':
        this.color = '#ff8800';
        this.weapon = new Rifle();
        break;
      case 'weapon_shotgun':
        this.color = '#8800ff';
        this.weapon = new Shotgun();
        break;
      case 'weapon_machinegun':
        this.color = '#ff0088';
        this.weapon = new MachineGun();
        break;
      case 'weapon_sniper':
        this.color = '#0088ff';
        this.weapon = new SniperRifle();
        break;
      case 'weapon_grenade':
        this.color = '#aaff00';
        this.weapon = new GrenadeLauncher();
        break;
      case 'weapon_laser':
        this.color = '#00ffff';
        this.weapon = new LaserGun();
        break;
      case 'weapon_knife':
        this.color = '#cccccc';
        this.weapon = new Knife();
        break;
      case 'weapon_sword':
        this.color = '#aaaaff';
        this.weapon = new Sword();
        break;
      case 'weapon_axe':
        this.color = '#884400';
        this.weapon = new Axe();
        break;
      case 'weapon_hammer':
        this.color = '#666666';
        this.weapon = new Hammer();
        break;
      case 'weapon_spear':
        this.color = '#996633';
        this.weapon = new Spear();
        break;
      case 'powerup_invincibility':
        this.color = '#ffffff';
        this.duration = 5000;
        break;
      case 'powerup_speed':
        this.color = '#00ffff';
        this.duration = 8000;
        break;
      case 'powerup_rapid_fire':
        this.color = '#ff6600';
        this.duration = 8000;
        this.fireRateMultiplier = 0.5; // Fire twice as fast
        break;
      case 'powerup_multi_shot':
        this.color = '#ff00ff';
        this.duration = 10000;
        break;
      case 'powerup_shield':
        this.color = '#00aaff';
        this.duration = 7000;
        this.shieldHealth = 50;
        break;
    }
  }

  update(deltaTime) {
    this.bobOffset += this.bobSpeed * deltaTime / 16;
  }

  apply(player) {
    switch (this.pickupType) {
      case 'health':
      case 'healing':
        player.heal(this.value);
        break;
      case 'ammo':
        player.getCurrentWeapon().currentAmmo = player.getCurrentWeapon().ammoCapacity;
        break;
      case 'damage_boost':
        // Store original damage values for all weapons
        const originalDamages = player.weapons.map(w => w.damage);
        player.weapons.forEach(w => {
          w.damage = Math.floor(w.damage * this.damageMultiplier);
        });
        player.hasDamageBoost = true;
        player.damageBoostEndTime = performance.now() + this.duration;
        setTimeout(() => {
          if (player.active) {
            player.weapons.forEach((w, i) => {
              w.damage = originalDamages[i];
            });
            player.hasDamageBoost = false;
            player.damageBoostEndTime = null;
          }
        }, this.duration);
        break;
      case 'weapon_rifle':
      case 'weapon_shotgun':
      case 'weapon_machinegun':
      case 'weapon_sniper':
      case 'weapon_grenade':
      case 'weapon_laser':
      case 'weapon_knife':
      case 'weapon_sword':
      case 'weapon_axe':
      case 'weapon_hammer':
      case 'weapon_spear':
        player.addWeapon(this.weapon);
        break;
      case 'powerup_invincibility':
        player.invulnerable = true;
        player.invulnerableEndTime = performance.now() + this.duration;
        setTimeout(() => {
          if (player.active) {
            player.invulnerable = false;
            player.invulnerableEndTime = null;
          }
        }, this.duration);
        break;
      case 'powerup_speed':
        const oldSpeed = player.speed;
        player.speed *= 1.5;
        player.speedBoostActive = true;
        player.speedBoostEndTime = performance.now() + this.duration;
        setTimeout(() => {
          if (player.active) {
            player.speed = oldSpeed;
            player.speedBoostActive = false;
            player.speedBoostEndTime = null;
          }
        }, this.duration);
        break;
      case 'powerup_rapid_fire':
        // Store original fire rates for all weapons
        const originalFireRates = player.weapons.map(w => w.fireRate);
        player.weapons.forEach(w => {
          w.fireRate = Math.floor(w.fireRate * this.fireRateMultiplier);
        });
        player.hasRapidFire = true;
        player.rapidFireEndTime = performance.now() + this.duration;
        setTimeout(() => {
          if (player.active) {
            player.weapons.forEach((w, i) => {
              w.fireRate = originalFireRates[i];
            });
            player.hasRapidFire = false;
            player.rapidFireEndTime = null;
          }
        }, this.duration);
        break;
      case 'powerup_multi_shot':
        player.hasMultiShot = true;
        player.multiShotEndTime = performance.now() + this.duration;
        setTimeout(() => {
          if (player.active) {
            player.hasMultiShot = false;
            player.multiShotEndTime = null;
          }
        }, this.duration);
        break;
      case 'powerup_shield':
        player.hasShield = true;
        player.shieldHealth = this.shieldHealth;
        player.shieldEndTime = performance.now() + this.duration;
        setTimeout(() => {
          if (player.active) {
            player.hasShield = false;
            player.shieldHealth = 0;
            player.shieldEndTime = null;
          }
        }, this.duration);
        break;
    }
    this.destroy();
  }

  render(ctx) {
    const yOffset = Math.sin(this.bobOffset) * 5;
    
    // === 16-BIT ARCADE PICKUP STYLE ===
    
    // Draw outer glow (16-bit pulsing effect)
    const pulseAlpha = 0.2 + Math.sin(this.bobOffset * 2) * 0.15;
    ctx.globalAlpha = pulseAlpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 6, this.y + yOffset - 6, this.width + 12, this.height + 12);
    
    // Draw middle glow
    ctx.globalAlpha = pulseAlpha * 1.5;
    ctx.fillRect(this.x - 3, this.y + yOffset - 3, this.width + 6, this.height + 6);
    
    // Draw pickup base with 16-bit shading
    ctx.globalAlpha = 1;
    
    // Main body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + yOffset, this.width, this.height);
    
    // 16-bit highlight
    const lighterColor = this.adjustColorBrightness(this.color, 40);
    ctx.fillStyle = lighterColor;
    ctx.fillRect(this.x, this.y + yOffset, this.width, 4);
    ctx.fillRect(this.x, this.y + yOffset, 4, this.height);
    
    // 16-bit shadow
    const darkerColor = this.adjustColorBrightness(this.color, -40);
    ctx.fillStyle = darkerColor;
    ctx.fillRect(this.x + this.width - 4, this.y + yOffset, 4, this.height);
    ctx.fillRect(this.x, this.y + yOffset + this.height - 4, this.width, 4);
    
    // Border outline (16-bit style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y + yOffset, this.width, this.height);
    
    // Draw icon/symbol (16-bit pixel art style)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let symbol = '?';
    if (this.pickupType === 'health' || this.pickupType === 'healing') {
      // Draw cross symbol (16-bit pixel style)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + this.width / 2 - 1, this.y + yOffset + 5, 2, 10);
      ctx.fillRect(this.x + this.width / 2 - 4, this.y + yOffset + 8, 8, 4);
    } else if (this.pickupType === 'ammo') {
      // Draw bullet icon (16-bit pixel style)
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(this.x + this.width / 2 - 2, this.y + yOffset + 6, 4, 8);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(this.x + this.width / 2 - 2, this.y + yOffset + 6, 4, 3);
    } else if (this.pickupType === 'damage_boost') {
      // Draw explosion icon (16-bit pixel style)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + this.width / 2 - 3, this.y + yOffset + 8, 6, 4);
      ctx.fillRect(this.x + this.width / 2 - 1, this.y + yOffset + 6, 2, 8);
      ctx.fillRect(this.x + this.width / 2 - 5, this.y + yOffset + 10, 2, 2);
      ctx.fillRect(this.x + this.width / 2 + 3, this.y + yOffset + 10, 2, 2);
    } else if (this.pickupType === 'powerup_rapid_fire') {
      // Draw rapid fire icon (multiple bullets)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 6, this.y + yOffset + 7, 2, 6);
      ctx.fillRect(this.x + 9, this.y + yOffset + 7, 2, 6);
      ctx.fillRect(this.x + 12, this.y + yOffset + 7, 2, 6);
    } else if (this.pickupType === 'powerup_multi_shot') {
      // Draw multi-directional arrows
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + this.width / 2 - 1, this.y + yOffset + 6, 2, 8);
      ctx.fillRect(this.x + this.width / 2 - 5, this.y + yOffset + 9, 10, 2);
    } else if (this.pickupType === 'powerup_shield') {
      // Draw shield icon (16-bit)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + this.width / 2 - 4, this.y + yOffset + 6, 8, 8);
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x + this.width / 2 - 2, this.y + yOffset + 8, 4, 4);
    } else if (this.pickupType.startsWith('weapon')) {
      // Draw detailed weapon icon based on type
      ctx.fillStyle = '#000000';
      
      // Different weapon visual styles
      if (this.pickupType === 'weapon_rifle') {
        // Rifle - longer barrel
        ctx.fillRect(this.x + 4, this.y + yOffset + 9, 12, 3);
        ctx.fillRect(this.x + 4, this.y + yOffset + 8, 4, 5);
      } else if (this.pickupType === 'weapon_shotgun') {
        // Shotgun - thick barrel
        ctx.fillRect(this.x + 5, this.y + yOffset + 8, 10, 5);
        ctx.fillRect(this.x + 5, this.y + yOffset + 9, 4, 3);
      } else if (this.pickupType === 'weapon_machinegun') {
        // Machine gun - very long with magazine
        ctx.fillRect(this.x + 3, this.y + yOffset + 9, 14, 2);
        ctx.fillRect(this.x + 3, this.y + yOffset + 8, 4, 5);
        ctx.fillRect(this.x + 5, this.y + yOffset + 11, 3, 4);
      } else if (this.pickupType === 'weapon_sniper') {
        // Sniper - long with scope
        ctx.fillRect(this.x + 2, this.y + yOffset + 10, 16, 2);
        ctx.fillRect(this.x + 2, this.y + yOffset + 9, 4, 4);
        ctx.fillRect(this.x + 7, this.y + yOffset + 8, 4, 2);
      } else if (this.pickupType === 'weapon_grenade') {
        // Grenade launcher - chunky
        ctx.fillRect(this.x + 4, this.y + yOffset + 8, 10, 6);
        ctx.fillRect(this.x + 12, this.y + yOffset + 9, 3, 4);
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.x + 7, this.y + yOffset + 10, 4, 3);
      } else if (this.pickupType === 'weapon_laser') {
        // Laser gun - futuristic
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x + 4, this.y + yOffset + 9, 12, 3);
        ctx.fillRect(this.x + 4, this.y + yOffset + 8, 5, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 14, this.y + yOffset + 10, 2, 1);
      } else {
        // Default weapon icon
        ctx.fillRect(this.x + 6, this.y + yOffset + 9, 8, 3);
        ctx.fillRect(this.x + 11, this.y + yOffset + 8, 3, 5);
      }
      
      // Draw weapon name label above pickup
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#000000';
      ctx.fillRect(this.x - 20, this.y + yOffset - 20, 60, 16);
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 20, this.y + yOffset - 20, 60, 16);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let weaponLabel = '';
      if (this.weapon) {
        weaponLabel = this.weapon.name.toUpperCase();
        if (weaponLabel.length > 9) {
          weaponLabel = weaponLabel.substring(0, 8) + '.';
        }
      }
      ctx.fillText(weaponLabel, this.x + this.width / 2, this.y + yOffset - 12);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    } else if (this.pickupType.startsWith('powerup')) {
      // Draw star/power icon
      ctx.fillStyle = '#ffffff';
      const cx = this.x + this.width / 2;
      const cy = this.y + yOffset + this.height / 2;
      ctx.fillRect(cx - 1, cy - 4, 2, 8);
      ctx.fillRect(cx - 4, cy - 1, 8, 2);
      ctx.fillRect(cx - 3, cy - 3, 2, 2);
      ctx.fillRect(cx + 1, cy - 3, 2, 2);
      ctx.fillRect(cx - 3, cy + 1, 2, 2);
      ctx.fillRect(cx + 1, cy + 1, 2, 2);
    } else {
      ctx.fillText(symbol, this.x + this.width / 2, this.y + yOffset + this.height / 2);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  
  // Helper to adjust color brightness for 16-bit shading
  adjustColorBrightness(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
}
