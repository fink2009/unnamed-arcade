// Particle system for explosions and effects
class Particle {
  constructor(x, y, dx, dy, color, lifetime) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.size = 3;
    this.active = true;
  }

  update(deltaTime) {
    this.x += this.dx * deltaTime / 16;
    this.y += this.dy * deltaTime / 16;
    this.dy += 0.2; // gravity
    this.lifetime -= deltaTime;
    
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx) {
    const alpha = this.lifetime / this.maxLifetime;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createExplosion(x, y, count = 20, color = '#ff6600') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = Math.random() * 500 + 500;
      
      this.particles.push(new Particle(x, y, dx, dy, color, lifetime));
    }
  }

  createSmoke(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const dx = (Math.random() - 0.5) * 2;
      const dy = -Math.random() * 2 - 1;
      const lifetime = Math.random() * 1000 + 1000;
      const gray = Math.floor(Math.random() * 100 + 100);
      const color = `rgb(${gray}, ${gray}, ${gray})`;
      
      this.particles.push(new Particle(x, y, dx, dy, color, lifetime));
    }
  }

  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.update(deltaTime);
      return p.active;
    });
  }

  render(ctx) {
    this.particles.forEach(p => p.render(ctx));
  }

  clear() {
    this.particles = [];
  }
}
