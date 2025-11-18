// Projectile entity
class Projectile extends Entity {
  constructor(x, y, dx, dy, damage, owner) {
    super(x, y, 8, 4);
    this.dx = dx;
    this.dy = dy;
    this.damage = damage;
    this.owner = owner;
    this.type = 'projectile';
    this.color = '#ffff00';
    this.maxDistance = 1000;
    this.distanceTraveled = 0;
    this.lifetime = null; // For melee weapons with short-range
    this.lifeTimer = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16;
    const moveX = this.dx * dt;
    const moveY = this.dy * dt;
    
    this.x += moveX;
    this.y += moveY;
    
    this.distanceTraveled += Math.sqrt(moveX * moveX + moveY * moveY);
    
    // Handle lifetime-based destruction (for melee weapons)
    if (this.lifetime !== null) {
      this.lifeTimer += deltaTime;
      if (this.lifeTimer >= this.lifetime) {
        this.destroy();
        return;
      }
    }
    
    if (this.distanceTraveled > this.maxDistance) {
      this.destroy();
    }
  }

  render(ctx) {
    // === 16-BIT ARCADE PROJECTILE STYLES ===
    
    if (this.color === '#00ffff') {
      // LASER PROJECTILE (16-bit sci-fi style)
      // Outer glow
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
      
      // Main beam
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Inner bright core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 2, this.y + 1, this.width - 4, this.height - 2);
      
      // Beam segments (16-bit animation effect)
      ctx.fillStyle = '#00cccc';
      for (let i = 0; i < this.width; i += 4) {
        ctx.fillRect(this.x + i, this.y, 2, this.height);
      }
      
    } else if (this.color === '#ffaa00') {
      // GRENADE PROJECTILE (16-bit explosive)
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(this.x + 1, this.y + this.height / 2 + 1, this.width, this.height / 2);
      
      // Main grenade body
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Highlights (16-bit shading)
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(this.x, this.y, this.width / 2, this.height / 2);
      
      // Dark band
      ctx.fillStyle = '#aa7700';
      ctx.fillRect(this.x, this.y + this.height / 2 - 1, this.width, 2);
      
      // Pin/fuse detail
      ctx.fillStyle = '#666666';
      ctx.fillRect(this.x + this.width / 2 - 1, this.y - 2, 2, 3);
      
      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      
    } else {
      // REGULAR BULLET (16-bit military style)
      
      // Muzzle flash trail (16-bit glow)
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = this.color || '#ffff00';
      ctx.fillRect(this.x - 6, this.y - 2, 6, this.height + 4);
      
      // Trail segments
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(this.x - 4, this.y - 1, 4, this.height + 2);
      
      // Main bullet body
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.color || '#ffff00';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Bullet highlight (16-bit shading)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x, this.y, this.width / 2, 1);
      ctx.fillRect(this.x, this.y, 1, this.height / 2);
      
      // Bullet shadow
      ctx.fillStyle = '#aa8800';
      ctx.fillRect(this.x + this.width / 2, this.y + this.height - 1, this.width / 2, 1);
      ctx.fillRect(this.x + this.width - 1, this.y + this.height / 2, 1, this.height / 2);
      
      // Bullet tip (pointed)
      ctx.fillStyle = '#cccc00';
      ctx.fillRect(this.x + this.width, this.y + 1, 2, this.height - 2);
      
      // Tracer streak (16-bit pixel trail)
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ff8800';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(this.x - 8 - i * 2, this.y + 1, 2, this.height - 2);
      }
      
      ctx.globalAlpha = 1;
    }
  }
}
