class Level {
  constructor() {
    this.groundLevel = 350;
    this.color = "green"; // Placeholder for the ground.
  }

  update() {
    // Future extensions for interactive objects or pickups.
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, this.groundLevel, canvas.width, canvas.height - this.groundLevel);
  }
}