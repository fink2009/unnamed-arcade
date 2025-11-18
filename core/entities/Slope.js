// Slope entity for varied terrain
class Slope extends Entity {
  constructor(x, y, width, height, direction = 'up') {
    super(x, y, width, height);
    this.type = 'slope';
    this.direction = direction; // 'up' = slopes up to the right, 'down' = slopes down to the right
  }

  // Get the Y position at a given X coordinate on the slope
  getYAtX(x) {
    if (x < this.x || x > this.x + this.width) {
      return null; // X is outside slope bounds
    }
    
    const relativeX = x - this.x;
    const progress = relativeX / this.width;
    
    if (this.direction === 'up') {
      // Slopes up to the right
      return this.y + this.height - (progress * this.height);
    } else {
      // Slopes down to the right
      return this.y + (progress * this.height);
    }
  }

  render(ctx) {
    // === 16-BIT ARCADE SLOPE STYLE ===
    
    // Slope colors (rocky/terrain look)
    const slopeBase = '#6a5a4a';
    const slopeDark = '#4a3a2a';
    const slopeLight = '#8a7a6a';
    const rockAccent = '#5a4a3a';
    
    ctx.save();
    
    // Draw slope as a filled triangle
    ctx.fillStyle = slopeBase;
    ctx.beginPath();
    
    if (this.direction === 'up') {
      // Triangle pointing up-right
      ctx.moveTo(this.x, this.y + this.height); // Bottom-left
      ctx.lineTo(this.x + this.width, this.y); // Top-right
      ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom-right
    } else {
      // Triangle pointing down-right
      ctx.moveTo(this.x, this.y); // Top-left
      ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom-right
      ctx.lineTo(this.x, this.y + this.height); // Bottom-left
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add highlight edge (16-bit shading)
    ctx.strokeStyle = slopeLight;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (this.direction === 'up') {
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y);
    } else {
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
    }
    ctx.stroke();
    
    // Add shadow edge
    ctx.strokeStyle = slopeDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.direction === 'up') {
      ctx.moveTo(this.x + this.width, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
    } else {
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y + this.height);
    }
    ctx.stroke();
    
    // Add texture details (16-bit rocks/bumps)
    ctx.fillStyle = rockAccent;
    for (let i = 0; i < this.width; i += 25) {
      for (let j = 0; j < this.height; j += 20) {
        const testX = this.x + i + Math.random() * 15;
        const testY = this.y + j + Math.random() * 15;
        const slopeY = this.getYAtX(testX);
        
        // Only draw rocks on the slope surface
        if (slopeY !== null && testY >= slopeY && testY <= this.y + this.height) {
          ctx.fillRect(testX, testY, 4, 4);
        }
      }
    }
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (this.direction === 'up') {
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
    } else {
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.lineTo(this.x, this.y);
    }
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }
}
