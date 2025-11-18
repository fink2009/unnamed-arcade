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
    // === 16-BIT ARCADE CRATE STYLE ===
    const healthPercent = this.health / this.maxHealth;
    
    // Base crate colors (16-bit wood texture)
    let crateBase = '#8b6a3a';
    let crateDark = '#6b4a1a';
    let crateLight = '#ab8a5a';
    let crateMid = '#7b5a2a';
    
    // Darker when damaged
    if (healthPercent < 0.5) {
      crateBase = '#7b5a2a';
      crateDark = '#5b3a0a';
      crateLight = '#9b7a4a';
      crateMid = '#6b4a1a';
    }
    
    // Main crate body
    ctx.fillStyle = crateBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 16-bit wood grain texture (horizontal lines)
    ctx.fillStyle = crateMid;
    for (let i = 0; i < this.height; i += 6) {
      ctx.fillRect(this.x, this.y + i, this.width, 2);
    }
    
    // Vertical planks
    ctx.fillStyle = crateDark;
    for (let i = 0; i < this.width; i += 10) {
      ctx.fillRect(this.x + i, this.y, 2, this.height);
    }
    
    // Highlights (16-bit shading)
    ctx.fillStyle = crateLight;
    ctx.fillRect(this.x, this.y, this.width, 3);
    ctx.fillRect(this.x, this.y, 3, this.height);
    
    // Shadows (16-bit shading)
    ctx.fillStyle = crateDark;
    ctx.fillRect(this.x + this.width - 3, this.y, 3, this.height);
    ctx.fillRect(this.x, this.y + this.height - 3, this.width, 3);
    
    // Metal bands/straps (16-bit style)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(this.x, this.y + this.height / 3, this.width, 3);
    ctx.fillRect(this.x, this.y + (this.height * 2 / 3), this.width, 3);
    
    // Metal highlights
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(this.x, this.y + this.height / 3, this.width, 1);
    ctx.fillRect(this.x, this.y + (this.height * 2 / 3), this.width, 1);
    
    // Corner brackets (16-bit metal corners)
    ctx.fillStyle = '#2a2a2a';
    // Top-left bracket
    ctx.fillRect(this.x, this.y, 5, 2);
    ctx.fillRect(this.x, this.y, 2, 5);
    // Top-right bracket
    ctx.fillRect(this.x + this.width - 5, this.y, 5, 2);
    ctx.fillRect(this.x + this.width - 2, this.y, 2, 5);
    // Bottom-left bracket
    ctx.fillRect(this.x, this.y + this.height - 2, 5, 2);
    ctx.fillRect(this.x, this.y + this.height - 5, 2, 5);
    // Bottom-right bracket
    ctx.fillRect(this.x + this.width - 5, this.y + this.height - 2, 5, 2);
    ctx.fillRect(this.x + this.width - 2, this.y + this.height - 5, 2, 5);
    
    // Border outline (16-bit style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Show damage cracks if damaged (16-bit pixel cracks)
    if (healthPercent < 0.7) {
      ctx.strokeStyle = '#2a1a0a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Crack pattern 1
      ctx.moveTo(this.x + 5, this.y);
      ctx.lineTo(this.x + 8, this.y + 10);
      ctx.lineTo(this.x + 6, this.y + 20);
      ctx.stroke();
      
      // Crack pattern 2
      ctx.beginPath();
      ctx.moveTo(this.x + this.width - 5, this.y + 5);
      ctx.lineTo(this.x + this.width - 8, this.y + 15);
      ctx.lineTo(this.x + this.width - 6, this.y + 25);
      ctx.stroke();
    }
    
    // Show severe damage if very damaged
    if (healthPercent < 0.3) {
      ctx.fillStyle = '#1a0a0a';
      // Burn marks / damage spots
      ctx.fillRect(this.x + 10, this.y + 8, 6, 6);
      ctx.fillRect(this.x + this.width - 14, this.y + 15, 5, 5);
      ctx.fillRect(this.x + 8, this.y + this.height - 12, 7, 4);
    }
  }
}
