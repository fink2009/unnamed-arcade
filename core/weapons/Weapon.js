// Base weapon class
class Weapon {
  constructor(name, damage, fireRate, ammoCapacity, reloadTime, projectileSpeed) {
    this.name = name;
    this.damage = damage;
    this.fireRate = fireRate; // ms between shots
    this.ammoCapacity = ammoCapacity;
    this.currentAmmo = ammoCapacity;
    this.reloadTime = reloadTime; // ms
    this.projectileSpeed = projectileSpeed;
    this.lastFireTime = 0;
    this.isReloading = false;
    this.reloadStartTime = 0;
  }

  canFire(currentTime) {
    return !this.isReloading && 
           this.currentAmmo > 0 && 
           currentTime - this.lastFireTime >= this.fireRate;
  }

  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero - default to shooting right if target is at gun position
    if (dist === 0) {
      return new Projectile(x, y, this.projectileSpeed, 0, this.damage, this);
    }
    
    const vx = (dx / dist) * this.projectileSpeed;
    const vy = (dy / dist) * this.projectileSpeed;

    return new Projectile(x, y, vx, vy, this.damage, this);
  }

  reload(currentTime) {
    if (!this.isReloading && this.currentAmmo < this.ammoCapacity) {
      this.isReloading = true;
      this.reloadStartTime = currentTime;
    }
  }

  update(currentTime) {
    if (this.isReloading && currentTime - this.reloadStartTime >= this.reloadTime) {
      this.currentAmmo = this.ammoCapacity;
      this.isReloading = false;
    }
  }
}

// Weapon types
class Pistol extends Weapon {
  constructor() {
    super('Pistol', 15, 300, 12, 1500, 15);
  }
}

class Rifle extends Weapon {
  constructor() {
    super('Rifle', 25, 150, 30, 2000, 20);
  }
}

class Shotgun extends Weapon {
  constructor() {
    super('Shotgun', 50, 800, 6, 2500, 12);
    this.pellets = 5;
    this.spread = 0.2;
  }

  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      // If we can't fire due to no ammo, start reloading automatically
      if (!this.isReloading && this.currentAmmo === 0) {
        this.reload(currentTime);
      }
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    const projectiles = [];
    const dx = targetX - x;
    const dy = targetY - y;
    const baseAngle = Math.atan2(dy, dx);

    for (let i = 0; i < this.pellets; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * this.spread;
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      projectiles.push(new Projectile(x, y, vx, vy, this.damage / this.pellets, this));
    }

    return projectiles;
  }
}

class MachineGun extends Weapon {
  constructor() {
    super('Machine Gun', 20, 100, 100, 3000, 18);
  }
}

class SniperRifle extends Weapon {
  constructor() {
    super('Sniper Rifle', 100, 1200, 5, 2500, 30);
  }
}

class GrenadeLauncher extends Weapon {
  constructor() {
    super('Grenade Launcher', 150, 2000, 6, 3000, 10);
    this.explosionRadius = 80;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.isExplosive = true;
    projectile.explosionRadius = this.explosionRadius;
    projectile.color = '#ffaa00';
    projectile.width = 10;
    projectile.height = 10;
    return projectile;
  }
}

class LaserGun extends Weapon {
  constructor() {
    super('Laser Gun', 30, 80, 999, 2000, 25);
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#00ffff';
    projectile.width = 12;
    projectile.height = 2;
    return projectile;
  }
}

// Melee Weapons
class Knife extends Weapon {
  constructor() {
    super('Knife', 35, 300, 999, 0, 20); // High fire rate, infinite ammo, fast
    this.isMelee = true;
    this.meleeRange = 60;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#cccccc';
    projectile.width = 8;
    projectile.height = 4;
    projectile.lifetime = this.meleeRange / this.projectileSpeed * 16; // Short lifetime for melee
    return projectile;
  }
}

class Sword extends Weapon {
  constructor() {
    super('Sword', 60, 500, 999, 0, 18);
    this.isMelee = true;
    this.meleeRange = 80;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.lastFireTime = currentTime;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#aaaaff';
    projectile.width = 12;
    projectile.height = 6;
    projectile.lifetime = this.meleeRange / this.projectileSpeed * 16;
    return projectile;
  }
}

class Axe extends Weapon {
  constructor() {
    super('Axe', 80, 700, 999, 0, 15);
    this.isMelee = true;
    this.meleeRange = 70;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.lastFireTime = currentTime;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#884400';
    projectile.width = 14;
    projectile.height = 8;
    projectile.lifetime = this.meleeRange / this.projectileSpeed * 16;
    return projectile;
  }
}

class Hammer extends Weapon {
  constructor() {
    super('Hammer', 100, 900, 999, 0, 12);
    this.isMelee = true;
    this.meleeRange = 75;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.lastFireTime = currentTime;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#666666';
    projectile.width = 16;
    projectile.height = 10;
    projectile.lifetime = this.meleeRange / this.projectileSpeed * 16;
    return projectile;
  }
}

class Spear extends Weapon {
  constructor() {
    super('Spear', 70, 600, 999, 0, 22);
    this.isMelee = true;
    this.meleeRange = 100; // Longer range than other melee
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.lastFireTime = currentTime;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#996633';
    projectile.width = 20;
    projectile.height = 4;
    projectile.lifetime = this.meleeRange / this.projectileSpeed * 16;
    return projectile;
  }
}
