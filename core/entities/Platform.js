// Platform entity for multi-floor level design
class Platform extends Entity {
  constructor(x, y, width, height, type = 'solid') {
    super(x, y, width, height);
    this.type = 'platform';
    this.platformType = type; // solid, passthrough (can jump through from below)
    this.color = '#4a4a3a';
  }

  render(ctx) {
    // === 16-BIT ARCADE PLATFORM STYLE ===
    
    // Platform colors (metallic/industrial look)
    const platformBase = '#5a5a4a';
    const platformDark = '#3a3a2a';
    const platformLight = '#7a7a6a';
    const metalAccent = '#8a8a7a';
    
    // Main platform body
    ctx.fillStyle = platformBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Top highlight (16-bit shading)
    ctx.fillStyle = platformLight;
    ctx.fillRect(this.x, this.y, this.width, 4);
    
    // Bottom shadow
    ctx.fillStyle = platformDark;
    ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
    
    // Side shadows
    ctx.fillRect(this.x, this.y, 3, this.height);
    ctx.fillRect(this.x + this.width - 3, this.y, 3, this.height);
    
    // Metal rivets/bolts (16-bit detail)
    ctx.fillStyle = metalAccent;
    for (let i = 0; i < this.width; i += 30) {
      // Top rivets
      ctx.fillRect(this.x + i + 5, this.y + 2, 3, 3);
      // Bottom rivets
      ctx.fillRect(this.x + i + 5, this.y + this.height - 5, 3, 3);
    }
    
    // Grid pattern (16-bit texture)
    ctx.fillStyle = platformDark;
    for (let i = 0; i < this.width; i += 20) {
      ctx.fillRect(this.x + i, this.y + 6, 1, this.height - 12);
    }
    
    // Border outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Visual indicator for passthrough platforms
    if (this.platformType === 'passthrough') {
      ctx.fillStyle = '#00ff00';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(this.x, this.y, this.width, 2);
      ctx.globalAlpha = 1;
    }
  }
}
