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
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
