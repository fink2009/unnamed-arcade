// Game UI and HUD
class GameUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  drawHUD(ctx, player, gameState) {
    ctx.save();
    
    // HUD Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, 50);
    ctx.fillRect(0, this.height - 50, this.width, 50);
    
    // Health
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('HEALTH', 10, 20);
    
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthPercent = player.health / player.maxHealth;
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(10, 25, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(10, 25, healthBarWidth * healthPercent, healthBarHeight);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 25, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.ceil(player.health)}/${player.maxHealth}`, 220, 40);
    
    // Weapon info
    const weapon = player.getCurrentWeapon();
    ctx.fillText('WEAPON', 10, this.height - 35);
    ctx.fillText(weapon.name, 10, this.height - 15);
    
    // Ammo
    ctx.fillText('AMMO', this.width - 150, this.height - 35);
    if (weapon.isReloading) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('RELOADING...', this.width - 150, this.height - 15);
    } else {
      ctx.fillStyle = weapon.currentAmmo === 0 ? '#ff0000' : '#fff';
      ctx.fillText(`${weapon.currentAmmo}/${weapon.ammoCapacity}`, this.width - 150, this.height - 15);
    }
    
    // Score
    ctx.fillStyle = '#fff';
    ctx.fillText(`SCORE: ${gameState.score}`, this.width - 150, 20);
    ctx.fillText(`KILLS: ${gameState.kills}`, this.width - 150, 40);
    
    // Wave info (for survival mode)
    if (gameState.mode === 'survival') {
      ctx.fillText(`WAVE: ${gameState.wave}`, this.width / 2 - 50, 20);
      ctx.fillText(`ENEMIES: ${gameState.enemiesRemaining}`, this.width / 2 - 50, 40);
    }
    
    ctx.restore();
  }

  drawMenu(ctx, menuState) {
    ctx.save();
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WAR SHOOTER', this.width / 2, 100);
    
    ctx.font = '24px monospace';
    
    if (menuState === 'main') {
      const options = [
        'Press 1 - CAMPAIGN',
        'Press 2 - SURVIVAL',
        'Press 3 - MULTIPLAYER (Coming Soon)',
        'Press 4 - SETTINGS'
      ];
      
      options.forEach((option, i) => {
        ctx.fillText(option, this.width / 2, 200 + i * 50);
      });
    } else if (menuState === 'character') {
      ctx.fillText('SELECT CHARACTER', this.width / 2, 150);
      
      const characters = [
        '1 - SOLDIER (Balanced)',
        '2 - SCOUT (Fast, Low HP)',
        '3 - HEAVY (Slow, High HP)',
        '4 - MEDIC (Healing)'
      ];
      
      characters.forEach((char, i) => {
        ctx.fillText(char, this.width / 2, 220 + i * 40);
      });
    } else if (menuState === 'paused') {
      ctx.fillText('PAUSED', this.width / 2, 200);
      ctx.fillText('Press ESC to Resume', this.width / 2, 250);
      ctx.fillText('Press M for Main Menu', this.width / 2, 290);
    } else if (menuState === 'gameover') {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('GAME OVER', this.width / 2, 200);
      ctx.fillStyle = '#fff';
      ctx.fillText(`Final Score: ${this.lastScore || 0}`, this.width / 2, 250);
      ctx.fillText('Press R to Restart', this.width / 2, 290);
      ctx.fillText('Press M for Main Menu', this.width / 2, 330);
    } else if (menuState === 'victory') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('VICTORY!', this.width / 2, 200);
      ctx.fillStyle = '#fff';
      ctx.fillText(`Final Score: ${this.lastScore || 0}`, this.width / 2, 250);
      ctx.fillText('Press R to Restart', this.width / 2, 290);
      ctx.fillText('Press M for Main Menu', this.width / 2, 330);
    }
    
    ctx.textAlign = 'left';
    ctx.restore();
  }

  drawLoadingScreen(ctx, progress) {
    ctx.save();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOADING...', this.width / 2, this.height / 2 - 30);
    
    // Progress bar
    const barWidth = 400;
    const barHeight = 30;
    const barX = (this.width - barWidth) / 2;
    const barY = this.height / 2;
    
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.floor(progress * 100)}%`, this.width / 2, this.height / 2 + 60);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }

  setLastScore(score) {
    this.lastScore = score;
  }
}
