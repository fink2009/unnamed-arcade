// Base Entity class for all game objects
class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.type = 'entity';
  }

  update(deltaTime) {
    // Override in subclasses
  }

  render(ctx) {
    // Override in subclasses
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  collidesWith(other) {
    const a = this.getBounds();
    const b = other.getBounds();
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  destroy() {
    this.active = false;
  }
}
