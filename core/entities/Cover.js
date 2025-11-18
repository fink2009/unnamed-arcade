// Cover/Obstacle entity - blocks projectiles
class Cover extends Entity {
  constructor(x, y, width, height, type = 'crate') {
    super(x, y, width, height);
    this.type = 'cover';
    this.coverType = type;
    this.health = 100; // Cover can be destroyed
    this.maxHealth = 100;
    this.indestructible = false;
  }

  takeDamage(amount) {
    if (this.indestructible) return false;
    
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true; // Cover destroyed
    }
    return false; // Cover damaged but not destroyed
  }

  render(ctx) {
    // Draw crate/cover
    const healthPercent = this.health / this.maxHealth;
    
    // Base color changes as cover takes damage
    let baseColor = '#654321';
    if (healthPercent < 0.5) {
      baseColor = '#543210'; // Darker when damaged
    }
    
    ctx.fillStyle = baseColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Crate detail lines
    ctx.strokeStyle = '#4a3219';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Cross pattern on crate
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width, this.y + this.height / 2);
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height);
    ctx.stroke();
    
    // Show damage cracks if damaged
    if (healthPercent < 0.7) {
      ctx.strokeStyle = '#2a1a09';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x + 5, this.y);
      ctx.lineTo(this.x + 10, this.y + this.height);
      ctx.moveTo(this.x + this.width - 5, this.y + 5);
      ctx.lineTo(this.x + this.width - 10, this.y + this.height - 5);
      ctx.stroke();
    }
  }
}
