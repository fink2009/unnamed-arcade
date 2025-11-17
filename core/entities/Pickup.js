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
      case 'powerup_invincibility':
        this.color = '#ffffff';
        this.duration = 5000;
        break;
      case 'powerup_speed':
        this.color = '#00ffff';
        this.duration = 8000;
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
        setTimeout(() => {
          if (player.active) {
            player.weapons.forEach((w, i) => {
              w.damage = originalDamages[i];
            });
            player.hasDamageBoost = false;
          }
        }, this.duration);
        break;
      case 'weapon_rifle':
      case 'weapon_shotgun':
      case 'weapon_machinegun':
      case 'weapon_sniper':
      case 'weapon_grenade':
      case 'weapon_laser':
        player.addWeapon(this.weapon);
        break;
      case 'powerup_invincibility':
        player.invulnerable = true;
        setTimeout(() => {
          if (player.active) {
            player.invulnerable = false;
          }
        }, this.duration);
        break;
      case 'powerup_speed':
        const oldSpeed = player.speed;
        player.speed *= 1.5;
        setTimeout(() => {
          if (player.active) {
            player.speed = oldSpeed;
          }
        }, this.duration);
        break;
    }
    this.destroy();
  }

  render(ctx) {
    const yOffset = Math.sin(this.bobOffset) * 5;
    
    // Draw glow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 5, this.y + yOffset - 5, this.width + 10, this.height + 10);
    
    // Draw pickup
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + yOffset, this.width, this.height);
    
    // Draw icon/symbol
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let symbol = '?';
    if (this.pickupType === 'health' || this.pickupType === 'healing') symbol = '+';
    else if (this.pickupType === 'ammo') symbol = 'A';
    else if (this.pickupType === 'damage_boost') symbol = 'D';
    else if (this.pickupType.startsWith('weapon')) symbol = 'W';
    else if (this.pickupType.startsWith('powerup')) symbol = '*';
    
    ctx.fillText(symbol, this.x + this.width / 2, this.y + yOffset + this.height / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
