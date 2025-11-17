class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 50;
    this.speed = 4;
    this.dy = 0;
    this.gravity = 0.5;
    this.jumpStrength = -10;
    this.isJumping = false;

    this.color = "blue"; // Placeholder for sprite.
  }

  update(deltaTime) {
    // Apply gravity
    this.dy += this.gravity;
    this.y += this.dy;

    // Prevent going below ground
    if (this.y > 300) {
      this.y = 300;
      this.dy = 0;
      this.isJumping = false;
    }

    // Controls
    if (keys["ArrowLeft"]) this.x -= this.speed;
    if (keys["ArrowRight"]) this.x += this.speed;
    if (keys["ArrowUp"] && !this.isJumping) {
      this.dy = this.jumpStrength;
      this.isJumping = true;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}