class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 50;
    this.color = "red"; // Placeholder.
    this.speed = 1.5;
  }

  update(player) {
    // Simple AI Logic: Move towards the player
    if (this.x > player.x) this.x -= this.speed;
    if (this.x < player.x) this.x += this.speed;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}