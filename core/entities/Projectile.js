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
  }

  update(deltaTime) {
    const dt = deltaTime / 16;
    const moveX = this.dx * dt;
    const moveY = this.dy * dt;
    
    this.x += moveX;
    this.y += moveY;
    
    this.distanceTraveled += Math.sqrt(moveX * moveX + moveY * moveY);
    
    if (this.distanceTraveled > this.maxDistance) {
      this.destroy();
    }
  }

  render(ctx) {
    // Different visuals based on projectile type
    if (this.color === '#00ffff') {
      // Laser projectile
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 2, this.y, this.width - 4, this.height);
      ctx.globalAlpha = 1;
    } else if (this.color === '#ffaa00') {
      // Grenade projectile
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#aa6600';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Regular projectile - Retro military style
      ctx.fillStyle = this.color || '#ffff00';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Add tracer effect
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(this.x - 2, this.y, 2, this.height);
      
      // Add muzzle flash glow
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = this.color || '#ffff00';
      ctx.fillRect(this.x - 4, this.y - 2, this.width + 4, this.height + 4);
      ctx.globalAlpha = 1;
    }
  }
}
