// Side-scrolling camera system
class Camera {
  constructor(width, height, worldWidth, worldHeight) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.following = null;
    this.deadzone = { x: 200, y: 100 };
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  follow(entity) {
    this.following = entity;
  }
  
  shake(intensity = 5, duration = 200) {
    if (window.game && !window.game.screenShake) return;
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  update() {
    // Don't update camera if game is not in playing state
    if (window.game && window.game.state !== 'playing') {
      return;
    }
    
    if (this.following) {
      // Get smoothness from game settings
      const smoothness = window.game ? window.game.cameraSmoothness : 0.1;
      
      // Center camera on followed entity with deadzone
      const targetX = this.following.x - this.width / 2 + this.following.width / 2;
      const targetY = this.following.y - this.height / 2 + this.following.height / 2;

      // Smooth camera movement
      this.x += (targetX - this.x) * smoothness;
      this.y += (targetY - this.y) * smoothness;

      // Clamp camera to world bounds
      this.x = Math.max(0, Math.min(this.worldWidth - this.width, this.x));
      this.y = Math.max(0, Math.min(this.worldHeight - this.height, this.y));
    }
    
    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeDuration -= 16; // Approximate frame time
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(-this.x + this.shakeX, -this.y + this.shakeY);
  }

  reset(ctx) {
    ctx.restore();
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x + this.shakeX,
      y: worldY - this.y + this.shakeY
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x - this.shakeX,
      y: screenY + this.y - this.shakeY
    };
  }
}
