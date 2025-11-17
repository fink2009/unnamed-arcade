// Collision detection system
class CollisionSystem {
  constructor() {
    this.entities = [];
  }

  add(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
    }
  }

  remove(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  checkCollisions() {
    const collisions = [];
    
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const a = this.entities[i];
        const b = this.entities[j];
        
        if (a.active && b.active && a.collidesWith(b)) {
          collisions.push({ a, b });
        }
      }
    }
    
    return collisions;
  }

  clear() {
    this.entities = [];
  }
}
