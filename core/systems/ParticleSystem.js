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
    // Special handling for bombs
    if (this.isBomb) {
      this.dy += this.gravity * deltaTime / 16;
      this.y += this.dy * deltaTime / 16;
      this.rotation += this.rotationSpeed * deltaTime / 16;
      
      // Check if bomb hit target
      if (this.y >= this.targetY) {
        this.active = false;
        // Trigger explosion when bomb hits
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createLargeExplosion(this.x, this.targetY);
        }
      }
      return;
    }
    
    this.x += this.dx * deltaTime / 16;
    this.y += this.dy * deltaTime / 16;
    this.dy += 0.2; // gravity
    this.lifetime -= deltaTime;
    
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx) {
    // Special rendering for bombs
    if (this.isBomb) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      // Draw bomb body
      ctx.fillStyle = '#333333';
      ctx.fillRect(-8, -10, 16, 20);
      
      // Draw bomb fins
      ctx.fillStyle = '#555555';
      ctx.fillRect(-12, -10, 4, 8);
      ctx.fillRect(8, -10, 4, 8);
      ctx.fillRect(-12, 2, 4, 8);
      ctx.fillRect(8, 2, 4, 8);
      
      // Draw bomb tip (nose)
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.lineTo(0, 18);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();
      
      // Draw warning stripes
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-8, -6, 16, 3);
      ctx.fillRect(-8, 3, 16, 3);
      
      ctx.restore();
      return;
    }
    
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
    this.textPopups = [];
  }

  createExplosion(x, y, count = 20, color = '#ff6600') {
    // Adjust particle count based on quality setting
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
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
    // Adjust particle count based on quality setting
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    for (let i = 0; i < count; i++) {
      const dx = (Math.random() - 0.5) * 2;
      const dy = -Math.random() * 2 - 1;
      const lifetime = Math.random() * 1000 + 1000;
      const gray = Math.floor(Math.random() * 100 + 100);
      const color = `rgb(${gray}, ${gray}, ${gray})`;
      
      this.particles.push(new Particle(x, y, dx, dy, color, lifetime));
    }
  }
  
  createTextPopup(x, y, text, color = '#ffff00') {
    this.textPopups.push({
      x: x,
      y: y,
      text: text,
      color: color,
      lifetime: 1000,
      maxLifetime: 1000,
      dy: -1,
      active: true
    });
  }
  
  createMeleeSlash(x, y, direction) {
    // Create a quick slash effect for melee attacks
    const slashParticles = 8;
    const angleOffset = direction > 0 ? 0 : Math.PI; // Face left or right
    
    for (let i = 0; i < slashParticles; i++) {
      const angle = angleOffset + (Math.PI / 4) * (i / slashParticles - 0.5);
      const speed = 8 + Math.random() * 4;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = 150 + Math.random() * 100;
      
      const particle = new Particle(x, y, dx, dy, '#ffffff', lifetime);
      particle.size = 4 + Math.random() * 3;
      this.particles.push(particle);
    }
  }
  
  createBombDrop(x, y, targetY, delay = 0) {
    // Create a bomb that drops from top of screen
    setTimeout(() => {
      const bomb = new Particle(x, y, 0, 0, '#333333', 10000); // Long lifetime
      bomb.isBomb = true;
      bomb.targetY = targetY;
      bomb.dy = 0;
      bomb.gravity = 0.5;
      bomb.rotation = 0;
      bomb.rotationSpeed = 0.2;
      this.particles.push(bomb);
    }, delay);
  }
  
  createLargeExplosion(x, y) {
    // Create a large explosion for airstrike bombs
    const explosionSize = window.game ? window.game.explosionSize : 1.0;
    const baseCount = 40;
    const count = Math.floor(baseCount * explosionSize);
    
    // Central bright flash
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 8 + 5;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = Math.random() * 600 + 600;
      
      // Multi-colored explosion (orange, red, yellow)
      const colors = ['#ff4400', '#ff8800', '#ffaa00', '#ffff00', '#ff0000'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = Math.random() * 5 + 3;
      this.particles.push(particle);
    }
    
    // Add smoke
    this.createSmoke(x, y, 20);
    
    // Add shockwave effect
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 12;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const particle = new Particle(x, y, dx, dy, '#ffffff', 300);
      particle.size = 6;
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.update(deltaTime);
      return p.active;
    });
    
    this.textPopups = this.textPopups.filter(t => {
      t.y += t.dy * deltaTime / 16;
      t.lifetime -= deltaTime;
      if (t.lifetime <= 0) {
        t.active = false;
      }
      return t.active;
    });
  }

  render(ctx) {
    this.particles.forEach(p => p.render(ctx));
    
    this.textPopups.forEach(t => {
      const alpha = t.lifetime / t.maxLifetime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    });
  }

  clear() {
    this.particles = [];
    this.textPopups = [];
  }
}
