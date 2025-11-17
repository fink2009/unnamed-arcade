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
  }

  follow(entity) {
    this.following = entity;
  }

  update() {
    if (this.following) {
      // Center camera on followed entity with deadzone
      const targetX = this.following.x - this.width / 2 + this.following.width / 2;
      const targetY = this.following.y - this.height / 2 + this.following.height / 2;

      // Smooth camera movement
      this.x += (targetX - this.x) * 0.1;
      this.y += (targetY - this.y) * 0.1;

      // Clamp camera to world bounds
      this.x = Math.max(0, Math.min(this.worldWidth - this.width, this.x));
      this.y = Math.max(0, Math.min(this.worldHeight - this.height, this.y));
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  reset(ctx) {
    ctx.restore();
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }
}
