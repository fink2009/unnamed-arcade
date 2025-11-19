// Game UI and HUD
class GameUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  drawHUD(ctx, player, gameState) {
    ctx.save();
    
    // Apply HUD opacity setting
    const hudOpacity = window.game ? window.game.hudOpacity : 0.9;
    ctx.globalAlpha = hudOpacity;
    
    // HUD Background (military style)
    ctx.fillStyle = 'rgba(26, 32, 38, 0.9)';
    ctx.fillRect(0, 0, this.width, 50);
    ctx.fillRect(0, this.height - 50, this.width, 50);
    
    // Add military-style border
    ctx.strokeStyle = '#4a6741';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, this.width - 4, 46);
    ctx.strokeRect(2, this.height - 48, this.width - 4, 46);
    
    ctx.globalAlpha = 1; // Reset for text and other elements
    
    // Low health warning overlay
    const healthPercent = player.health / player.maxHealth;
    if (healthPercent < 0.25) {
      const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.15;
      ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // Health
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('HEALTH', 10, 20);
    
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(10, 25, healthBarWidth, healthBarHeight);
    
    // Health color based on percentage
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(10, 25, healthBarWidth * healthPercent, healthBarHeight);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 25, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`${Math.ceil(player.health)}/${player.maxHealth}`, 220, 40);
    
    // Weapon info
    const weapon = player.getCurrentWeapon();
    ctx.fillStyle = '#00ff00';
    ctx.fillText('WEAPON', 10, this.height - 35);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(weapon.name.toUpperCase(), 10, this.height - 15);
    
    // Ammo
    ctx.fillStyle = '#00ff00';
    ctx.fillText('AMMO', this.width - 150, this.height - 35);
    if (weapon.isReloading) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('RELOADING...', this.width - 150, this.height - 15);
    } else {
      ctx.fillStyle = weapon.currentAmmo === 0 ? '#ff0000' : '#ffff00';
      ctx.fillText(`${weapon.currentAmmo}/${weapon.ammoCapacity}`, this.width - 150, this.height - 15);
    }
    
    // Score and level info
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`SCORE: ${gameState.score}`, this.width - 150, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`KILLS: ${gameState.kills}`, this.width - 150, 40);
    
    // Mode and level/wave - removed duplicate, kept only in section below
    
    // Combo display
    if (gameState.combo > 1) {
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 24px monospace';
      const comboX = this.width / 2 - 50;
      const comboY = 80;
      
      // Pulsing effect
      const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1;
      ctx.save();
      ctx.translate(comboX + 50, comboY);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-(comboX + 50), -comboY);
      
      ctx.fillStyle = '#000000';
      ctx.fillText(`${gameState.combo}x COMBO!`, comboX + 2, comboY + 2);
      ctx.fillStyle = '#ff6600';
      ctx.fillText(`${gameState.combo}x COMBO!`, comboX, comboY);
      
      ctx.restore();
      ctx.font = 'bold 16px monospace';
    }
    
    // Special Ability indicator
    if (player.specialAbilityName) {
      const cooldownRemaining = Math.max(0, player.specialAbilityCooldown - (window.game.currentTime - player.lastSpecialUse));
      const cooldownPercent = 1 - (cooldownRemaining / player.specialAbilityCooldown);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '14px monospace';
      ctx.fillText(`ABILITY [E]: ${player.specialAbilityName}`, 220, this.height - 35);
      
      // Cooldown bar
      const abilityBarWidth = 150;
      const abilityBarHeight = 8;
      ctx.fillStyle = '#330000';
      ctx.fillRect(220, this.height - 25, abilityBarWidth, abilityBarHeight);
      
      if (cooldownRemaining <= 0) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(220, this.height - 25, abilityBarWidth, abilityBarHeight);
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('READY!', 380, this.height - 18);
      } else {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(220, this.height - 25, abilityBarWidth * cooldownPercent, abilityBarHeight);
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText(`${(cooldownRemaining / 1000).toFixed(1)}s`, 380, this.height - 18);
      }
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      ctx.strokeRect(220, this.height - 25, abilityBarWidth, abilityBarHeight);
    }
    
    // Wave/Level info (consolidated from duplicate above)
    if (gameState.mode === 'survival') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`WAVE: ${gameState.wave}`, this.width / 2 - 50, 20);
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`ENEMIES: ${gameState.enemiesRemaining}`, this.width / 2 - 50, 40);
    } else if (gameState.mode === 'campaign' && window.game) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`LEVEL: ${window.game.currentLevel}/${window.game.maxLevel}`, this.width / 2 - 50, 20);
      if (window.game.currentLevelName) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '14px monospace';
        ctx.fillText(window.game.currentLevelName, this.width / 2 - 50, 40);
        ctx.font = '16px monospace';
      }
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`ENEMIES: ${gameState.enemiesRemaining}`, this.width / 2 - 50, 55);
    }
    
    // Difficulty indicator and help hint
    if (window.game && window.game.difficulty) {
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.fillText(`[${window.game.difficulty.toUpperCase()}]`, this.width / 2 - 30, this.height - 10);
      ctx.fillText('Press H for Help', this.width / 2 + 40, this.height - 10);
    }
    
    // Active power-ups indicator with timers
    let powerupY = this.height - 35;
    const currentTime = performance.now();
    
    if (player.invulnerable && player.invulnerableEndTime) {
      const timeLeft = Math.ceil((player.invulnerableEndTime - currentTime) / 1000);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`⚡ INVULNERABLE (${timeLeft}s)`, this.width / 2 + 80, powerupY);
      powerupY -= 20;
    }
    if (player.hasDamageBoost && player.damageBoostEndTime) {
      const timeLeft = Math.ceil((player.damageBoostEndTime - currentTime) / 1000);
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`💥 DAMAGE BOOST (${timeLeft}s)`, this.width / 2 + 80, powerupY);
      powerupY -= 20;
    }
    if (player.speedBoostActive && player.speedBoostEndTime) {
      const timeLeft = Math.ceil((player.speedBoostEndTime - currentTime) / 1000);
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`⚡ SPEED BOOST (${timeLeft}s)`, this.width / 2 + 80, powerupY);
      powerupY -= 20;
    }
    if (player.hasRapidFire && player.rapidFireEndTime) {
      const timeLeft = Math.ceil((player.rapidFireEndTime - currentTime) / 1000);
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`🔥 RAPID FIRE (${timeLeft}s)`, this.width / 2 + 80, powerupY);
      powerupY -= 20;
    }
    if (player.hasMultiShot && player.multiShotEndTime) {
      const timeLeft = Math.ceil((player.multiShotEndTime - currentTime) / 1000);
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`✨ MULTI-SHOT (${timeLeft}s)`, this.width / 2 + 80, powerupY);
      powerupY -= 20;
    }
    if (player.hasShield && player.shieldEndTime) {
      const timeLeft = Math.ceil((player.shieldEndTime - currentTime) / 1000);
      ctx.fillStyle = '#00aaff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`🛡️ SHIELD: ${player.shieldHealth} (${timeLeft}s)`, this.width / 2 + 80, powerupY);
      powerupY -= 20;
    }
    
    // FPS counter
    if (window.game && window.game.showFPS) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`FPS: ${window.game.fps}`, 10, this.height - 60);
    }
    
    // Minimap
    if (window.game && gameState.mode) {
      const minimapWidth = 150;
      const minimapHeight = 80;
      const minimapX = this.width - minimapWidth - 10;
      const minimapY = 60;
      
      // Minimap background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
      
      // Scale factor for world to minimap
      const worldWidth = window.game.worldWidth || 3000;
      const scaleX = minimapWidth / worldWidth;
      const scaleY = minimapHeight / (window.game.worldHeight || 600);
      
      // Draw player
      const playerMapX = minimapX + (player.x * scaleX);
      const playerMapY = minimapY + (player.y * scaleY);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(playerMapX - 2, playerMapY - 2, 4, 4);
      
      // Draw enemies
      if (window.game.enemies) {
        window.game.enemies.forEach(enemy => {
          if (enemy.active) {
            const enemyMapX = minimapX + (enemy.x * scaleX);
            const enemyMapY = minimapY + (enemy.y * scaleY);
            ctx.fillStyle = enemy.enemyType === 'boss' ? '#ff0000' : '#ff6666';
            ctx.fillRect(enemyMapX - 1, enemyMapY - 1, 2, 2);
          }
        });
      }
      
      // Draw pickups
      if (window.game.pickups) {
        window.game.pickups.forEach(pickup => {
          if (pickup.active) {
            const pickupMapX = minimapX + (pickup.x * scaleX);
            const pickupMapY = minimapY + (pickup.y * scaleY);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(pickupMapX - 1, pickupMapY - 1, 2, 2);
          }
        });
      }
      
      // Minimap label
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      ctx.fillText('MAP', minimapX + 5, minimapY + 12);
    }
    
    // Crosshair (drawn without camera transform)
    if (window.game && window.game.crosshairStyle !== 'none') {
      const mousePos = window.game.inputManager.getMousePosition();
      const x = mousePos.x;
      const y = mousePos.y;
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      
      if (window.game.crosshairStyle === 'cross') {
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + 10, y);
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
      } else if (window.game.crosshairStyle === 'dot') {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      } else if (window.game.crosshairStyle === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Help overlay
    if (window.game && window.game.showHelp) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, this.width, this.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QUICK REFERENCE (Press H to toggle)', this.width / 2, 80);
      
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      const startX = 150;
      let y = 120;
      
      const tips = [
        ['MOVEMENT', '#ffff00'],
        ['WASD/Arrows - Move', '#00ff00'],
        ['Space - Jump', '#00ff00'],
        ['Shift - Dodge Roll', '#00ff00'],
        ['', ''],
        ['COMBAT', '#ffff00'],
        ['Mouse - Aim & Shoot', '#00ff00'],
        ['R - Reload', '#00ff00'],
        ['E/Q - Special Ability', '#00ff00'],
        ['1-4 - Switch Weapons', '#00ff00'],
        ['', ''],
        ['TIPS', '#ffff00'],
        ['• Kill enemies to drop power-ups', '#888'],
        ['• Chain kills for combo bonuses', '#888'],
        ['• Bosses spawn every 5 waves', '#888'],
        ['• Each character has unique abilities', '#888'],
        ['• Check minimap for enemies & items', '#888'],
      ];
      
      tips.forEach(([text, color]) => {
        if (text) {
          ctx.fillStyle = color;
          ctx.fillText(text, startX, y);
        }
        y += text === '' ? 10 : 25;
      });
      
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Press H to close', this.width / 2, this.height - 30);
    }
    
    // Boss health bar at top of screen
    if (window.game && window.game.enemies) {
      const boss = window.game.enemies.find(e => e.isBoss && e.active);
      if (boss) {
        this.drawBossHealthBar(ctx, boss);
      }
    }
    
    ctx.restore();
  }
  
  drawBossHealthBar(ctx, boss) {
    // Large boss health bar at the top of the screen
    const barWidth = 800;
    const barHeight = 35;
    const barX = (this.width - barWidth) / 2;
    const barY = 60;
    
    // Background panel
    ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    ctx.fillRect(barX - 10, barY - 10, barWidth + 20, barHeight + 20);
    
    // Border
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX - 10, barY - 10, barWidth + 20, barHeight + 20);
    
    // Boss name
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(boss.bossName || 'BOSS', this.width / 2, barY - 15);
    
    // Health bar background
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health bar fill
    const healthPercent = Math.max(0, boss.health / boss.maxHealth);
    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth * healthPercent, 0);
    
    if (healthPercent > 0.5) {
      gradient.addColorStop(0, '#ff6600');
      gradient.addColorStop(1, '#ff0000');
    } else if (healthPercent > 0.25) {
      gradient.addColorStop(0, '#ff0000');
      gradient.addColorStop(1, '#cc0000');
    } else {
      gradient.addColorStop(0, '#cc0000');
      gradient.addColorStop(1, '#880000');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Health bar segments (visual dividers)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for (let i = 1; i < 10; i++) {
      const segmentX = barX + (barWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(segmentX, barY);
      ctx.lineTo(segmentX, barY + barHeight);
      ctx.stroke();
    }
    
    // Health bar border
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    const healthText = `${Math.ceil(boss.health)} / ${boss.maxHealth}`;
    ctx.fillText(healthText, this.width / 2, barY + barHeight / 2 + 7);
    ctx.shadowBlur = 0;
    
    // Shield indicator
    if (boss.shieldActive) {
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('⚡ SHIELD ACTIVE ⚡', this.width / 2, barY + barHeight + 18);
    }
    
    // Enraged indicator
    if (boss.enraged) {
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('🔥 ENRAGED 🔥', this.width / 2, barY + barHeight + 18);
    }
    
    ctx.textAlign = 'left';
  }

  drawMenu(ctx, menuState) {
    ctx.save();
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Title - only show on main menu, character select, paused, gameover, and victory screens
    if (['main', 'character', 'paused', 'gameover', 'victory'].includes(menuState)) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('WAR SHOOTER', this.width / 2, 100);
    }
    
    ctx.font = '24px monospace';
    
    if (menuState === 'main') {
      const options = [
        'Press 1 - CAMPAIGN',
        'Press 2 - SURVIVAL',
        'Press 3 - SETTINGS',
        'Press 4 - CONTROLS',
        'Press 5 - HIGH SCORES'
      ];
      
      ctx.fillStyle = '#00ff00';
      options.forEach((option, i) => {
        ctx.fillText(option, this.width / 2, 200 + i * 45);
      });
    } else if (menuState === 'highscores') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('HIGH SCORES', this.width / 2, 100);
      
      if (window.game && window.game.highScoreSystem) {
        const scores = window.game.highScoreSystem.getTopScores(10);
        
        if (scores.length === 0) {
          ctx.fillStyle = '#888';
          ctx.font = '18px monospace';
          ctx.fillText('No high scores yet!', this.width / 2, 200);
          ctx.fillText('Play a game to set a score', this.width / 2, 230);
        } else {
          ctx.font = '14px monospace';
          ctx.fillStyle = '#ffff00';
          ctx.fillText('RANK  SCORE    MODE     DIFFICULTY  CHARACTER', this.width / 2, 140);
          
          scores.forEach((entry, i) => {
            ctx.fillStyle = i < 3 ? '#ffaa00' : '#00ff00';
            const rank = (i + 1).toString().padStart(2, ' ');
            const score = entry.score.toString().padStart(7, ' ');
            const mode = entry.mode.substring(0, 8).padEnd(8, ' ');
            const diff = entry.difficulty.substring(0, 10).padEnd(10, ' ');
            const char = entry.character.substring(0, 9);
            
            ctx.fillText(`${rank}.  ${score}  ${mode}  ${diff}  ${char}`, this.width / 2, 170 + i * 25);
          });
        }
      }
      
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'character') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('SELECT CHARACTER', this.width / 2, 150);
      
      const characters = [
        {key: '1', name: 'SOLDIER', desc: 'Balanced stats, Airstrike ability'},
        {key: '2', name: 'SCOUT', desc: 'Fast movement, Sprint Boost ability'},
        {key: '3', name: 'HEAVY', desc: 'High HP, Shield ability'},
        {key: '4', name: 'MEDIC', desc: 'Passive healing, Med Pack ability'}
      ];
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '18px monospace';
      characters.forEach((char, i) => {
        ctx.fillText(`${char.key} - ${char.name}`, this.width / 2, 220 + i * 60);
        ctx.fillStyle = '#888';
        ctx.font = '14px monospace';
        ctx.fillText(char.desc, this.width / 2, 240 + i * 60);
        ctx.fillStyle = '#00ff00';
        ctx.font = '18px monospace';
      });
      
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'settings') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('SETTINGS', this.width / 2, 80);
      
      // Page indicator
      const page = window.game ? window.game.settingsPage : 0;
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText(`Page ${page + 1}/3 - Use ← → to navigate`, this.width / 2, 110);
      
      ctx.font = '20px monospace';
      
      if (page === 0) {
        // Page 0: Difficulty & Audio
        ctx.fillStyle = '#ffff00';
        ctx.fillText('DIFFICULTY & AUDIO', this.width / 2, 150);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '18px monospace';
        ctx.fillText('DIFFICULTY:', this.width / 2, 190);
        
        const difficulties = [
          { key: '1', name: 'BABY', value: 'baby' },
          { key: '2', name: 'EASY', value: 'easy' },
          { key: '3', name: 'MEDIUM', value: 'medium' },
          { key: '4', name: 'EXTREME', value: 'extreme' }
        ];
        
        difficulties.forEach((diff, i) => {
          const isSelected = window.game && window.game.difficulty === diff.value;
          ctx.fillStyle = isSelected ? '#ffff00' : '#00ff00';
          ctx.font = '16px monospace';
          ctx.fillText(`${diff.key} - ${diff.name}${isSelected ? ' ✓' : ''}`, 
                      this.width / 2, 220 + i * 30);
        });
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '18px monospace';
        ctx.fillText('AUDIO:', this.width / 2, 360);
        const audioStatus = window.game && window.game.audioEnabled ? 'ON' : 'OFF';
        ctx.font = '16px monospace';
        ctx.fillText(`5 - Toggle Audio [${audioStatus}]`, this.width / 2, 390);
        
        const masterVol = window.game ? Math.round(window.game.masterVolume * 100) : 100;
        ctx.fillText(`6/7 - Master Volume: ${masterVol}%`, this.width / 2, 420);
        
        const sfxVol = window.game ? Math.round(window.game.sfxVolume * 100) : 80;
        ctx.fillText(`8/9 - SFX Volume: ${sfxVol}%`, this.width / 2, 450);
        
        const musicVol = window.game ? Math.round(window.game.musicVolume * 100) : 70;
        ctx.fillText(`0/- - Music Volume: ${musicVol}%`, this.width / 2, 480);
      }
      else if (page === 1) {
        // Page 1: Graphics & Display
        ctx.fillStyle = '#ffff00';
        ctx.fillText('GRAPHICS & DISPLAY', this.width / 2, 150);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px monospace';
        
        const screenShake = window.game && window.game.screenShake ? 'ON' : 'OFF';
        ctx.fillText(`1 - Screen Shake [${screenShake}]`, this.width / 2, 200);
        
        const particleQuality = window.game ? window.game.particleQuality.toUpperCase() : 'HIGH';
        ctx.fillText(`2 - Particle Quality [${particleQuality}]`, this.width / 2, 230);
        
        const showFPS = window.game && window.game.showFPS ? 'ON' : 'OFF';
        ctx.fillText(`3 - Show FPS [${showFPS}]`, this.width / 2, 260);
        
        const camSmooth = window.game ? (window.game.cameraSmoothness * 100).toFixed(0) : '10';
        ctx.fillText(`4/5 - Camera Smoothness: ${camSmooth}`, this.width / 2, 290);
        
        const crosshair = window.game ? window.game.crosshairStyle.toUpperCase() : 'CROSS';
        ctx.fillText(`6 - Crosshair Style [${crosshair}]`, this.width / 2, 320);
        
        const hudOpacity = window.game ? Math.round(window.game.hudOpacity * 100) : 90;
        ctx.fillText(`7/8 - HUD Opacity: ${hudOpacity}%`, this.width / 2, 350);
      }
      else if (page === 2) {
        // Page 2: Gameplay & Accessibility
        ctx.fillStyle = '#ffff00';
        ctx.fillText('GAMEPLAY & ACCESSIBILITY', this.width / 2, 150);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px monospace';
        
        const autoReload = window.game && window.game.autoReload ? 'ON' : 'OFF';
        ctx.fillText(`1 - Auto Reload [${autoReload}]`, this.width / 2, 185);
        
        const colorBlind = window.game ? window.game.colorBlindMode.toUpperCase() : 'NONE';
        ctx.fillText(`2 - Color Blind Mode [${colorBlind}]`, this.width / 2, 210);
        
        const bloodEffects = window.game && window.game.bloodEffects ? 'ON' : 'OFF';
        ctx.fillText(`3 - Blood Effects [${bloodEffects}]`, this.width / 2, 235);
        
        const screenFlash = window.game && window.game.screenFlash ? 'ON' : 'OFF';
        ctx.fillText(`4 - Screen Flash [${screenFlash}]`, this.width / 2, 260);
        
        const enemyAggro = window.game ? window.game.enemyAggression.toFixed(1) : '1.0';
        ctx.fillText(`5/6 - Enemy Aggression: ${enemyAggro}x`, this.width / 2, 285);
        
        const bulletSpd = window.game ? window.game.bulletSpeed.toFixed(1) : '1.0';
        ctx.fillText(`7/8 - Bullet Speed: ${bulletSpd}x`, this.width / 2, 310);
        
        const explSize = window.game ? window.game.explosionSize.toFixed(1) : '1.0';
        ctx.fillText(`9/0 - Explosion Size: ${explSize}x`, this.width / 2, 335);
        
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText('Tweak these settings to customize your experience', this.width / 2, 370);
      }
      
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'controls') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('CONTROLS', this.width / 2, 100);
      
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      
      const controls = [
        'MOVEMENT:',
        '  A/D or Arrow Keys - Move Left/Right',
        '  W/Space - Jump',
        '  S - Crouch',
        '  C/Ctrl - Slide',
        '',
        'COMBAT:',
        '  Mouse - Aim',
        '  Left Click - Shoot (Ranged)',
        '  Right Click/F - Melee Attack',
        '  R - Reload',
        '  E/Q - Special Ability',
        '  1/2/3/4 - Switch Weapons',
        '',
        'GAME:',
        '  ESC - Pause/Menu',
        '  M - Return to Main Menu'
      ];
      
      const startX = 250;
      let startY = 150;
      
      controls.forEach((line, i) => {
        if (line === '') {
          startY += 10;
        } else if (line.endsWith(':')) {
          ctx.fillStyle = '#ffff00';
          ctx.fillText(line, startX, startY);
          startY += 30;
        } else {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(line, startX, startY);
          startY += 25;
        }
      });
      
      ctx.textAlign = 'center';
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'paused') {
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('PAUSED', this.width / 2, 150);
      
      // Show current stats
      if (window.game) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '18px monospace';
        ctx.fillText(`Score: ${window.game.score}`, this.width / 2, 200);
        ctx.fillText(`Kills: ${window.game.kills}`, this.width / 2, 230);
        ctx.fillText(`Wave: ${window.game.wave}`, this.width / 2, 260);
        if (window.game.combo > 0) {
          ctx.fillText(`Current Combo: ${window.game.combo}x`, this.width / 2, 290);
        }
      }
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '20px monospace';
      ctx.fillText('Press ESC to Resume', this.width / 2, 350);
      ctx.fillText('Press M for Main Menu', this.width / 2, 385);
      ctx.fillText('Press R to Restart', this.width / 2, 420);
    } else if (menuState === 'gameover') {
      ctx.fillStyle = '#ff0000';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('GAME OVER', this.width / 2, 120);
      
      // Display stats
      ctx.fillStyle = '#ffff00';
      ctx.font = '20px monospace';
      ctx.fillText(`Final Score: ${this.lastScore || 0}`, this.width / 2, 170);
      
      if (window.game) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px monospace';
        // Use finalPlayTime if available (captured at death), otherwise calculate live
        const playTime = window.game.finalPlayTime !== undefined ? 
          (window.game.finalPlayTime / 1000).toFixed(1) :
          ((window.game.currentTime - window.game.gameStartTime) / 1000).toFixed(1);
        ctx.fillText(`Play Time: ${playTime}s`, this.width / 2, 210);
        ctx.fillText(`Kills: ${window.game.kills}`, this.width / 2, 235);
        ctx.fillText(`Max Combo: ${window.game.maxCombo}x`, this.width / 2, 260);
        const accuracy = window.game.shotsFired > 0 ? 
          ((window.game.shotsHit / window.game.shotsFired) * 100).toFixed(1) : 0;
        ctx.fillText(`Accuracy: ${accuracy}%`, this.width / 2, 285);
        ctx.fillText(`Damage Dealt: ${window.game.totalDamageDealt}`, this.width / 2, 310);
        ctx.fillText(`Damage Taken: ${window.game.totalDamageTaken}`, this.width / 2, 335);
      }
      
      ctx.fillStyle = '#fff';
      ctx.font = '18px monospace';
      ctx.fillText('Press R to Restart', this.width / 2, 390);
      ctx.fillText('Press M for Main Menu', this.width / 2, 420);
    } else if (menuState === 'victory') {
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('VICTORY!', this.width / 2, 120);
      
      // Display stats
      ctx.fillStyle = '#ffff00';
      ctx.font = '20px monospace';
      ctx.fillText(`Final Score: ${this.lastScore || 0}`, this.width / 2, 170);
      
      if (window.game) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px monospace';
        // Use finalPlayTime if available (captured at victory), otherwise calculate live
        const playTime = window.game.finalPlayTime !== undefined ? 
          (window.game.finalPlayTime / 1000).toFixed(1) :
          ((window.game.currentTime - window.game.gameStartTime) / 1000).toFixed(1);
        ctx.fillText(`Play Time: ${playTime}s`, this.width / 2, 210);
        ctx.fillText(`Kills: ${window.game.kills}`, this.width / 2, 235);
        ctx.fillText(`Max Combo: ${window.game.maxCombo}x`, this.width / 2, 260);
        const accuracy = window.game.shotsFired > 0 ? 
          ((window.game.shotsHit / window.game.shotsFired) * 100).toFixed(1) : 0;
        ctx.fillText(`Accuracy: ${accuracy}%`, this.width / 2, 285);
        ctx.fillText(`Damage Dealt: ${window.game.totalDamageDealt}`, this.width / 2, 310);
        ctx.fillText(`Damage Taken: ${window.game.totalDamageTaken}`, this.width / 2, 335);
      }
      
      ctx.fillStyle = '#fff';
      ctx.font = '18px monospace';
      ctx.fillText('Press R to Restart', this.width / 2, 390);
      ctx.fillText('Press M for Main Menu', this.width / 2, 420);
    } else if (menuState === 'levelcomplete') {
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('LEVEL COMPLETE!', this.width / 2, 150);
      
      if (window.game) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '24px monospace';
        ctx.fillText(`Level ${window.game.currentLevel} - ${window.game.currentLevelName || 'Complete'}`, this.width / 2, 200);
        
        const levelBonus = window.game.currentLevel * 1000;
        ctx.fillStyle = '#00ff00';
        ctx.font = '20px monospace';
        ctx.fillText(`Bonus: +${levelBonus}`, this.width / 2, 250);
        ctx.fillText(`Total Score: ${window.game.score}`, this.width / 2, 280);
        
        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.fillText('Preparing next level...', this.width / 2, 350);
        ctx.fillText('Get ready!', this.width / 2, 380);
      }
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
  
  drawWeaponSwapPopup(ctx, weaponSwapData, player) {
    ctx.save();
    
    // Semi-transparent background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Popup background
    const popupWidth = 600;
    const popupHeight = 300;
    const popupX = (this.width - popupWidth) / 2;
    const popupY = (this.height - popupHeight) / 2;
    
    // 16-bit style popup box
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(popupX, popupY, popupWidth, popupHeight);
    
    // Border
    ctx.strokeStyle = '#4a6a8a';
    ctx.lineWidth = 4;
    ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);
    
    // Inner border
    ctx.strokeStyle = '#2a4a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(popupX + 5, popupY + 5, popupWidth - 10, popupHeight - 10);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WEAPON FOUND!', this.width / 2, popupY + 40);
    
    // Weapon info
    const weapon = weaponSwapData.weapon;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(weapon.name.toUpperCase(), this.width / 2, popupY + 80);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = '16px monospace';
    ctx.fillText(`Damage: ${weapon.damage}  |  Fire Rate: ${weapon.fireRate}ms  |  Ammo: ${weapon.ammoCapacity}`, 
                 this.width / 2, popupY + 110);
    
    // Message
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText('You have max weapons! Swap one?', this.width / 2, popupY + 150);
    
    // Options
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('[Y] YES - Choose weapon to replace', this.width / 2, popupY + 200);
    ctx.fillText('[N] NO - Leave on ground', this.width / 2, popupY + 230);
    
    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.fillText('[ESC] Cancel', this.width / 2, popupY + 260);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }
  
  drawWeaponSwapSelect(ctx, weaponSwapData, player) {
    ctx.save();
    
    // Semi-transparent background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Popup background
    const popupWidth = 700;
    const popupHeight = 400;
    const popupX = (this.width - popupWidth) / 2;
    const popupY = (this.height - popupHeight) / 2;
    
    // 16-bit style popup box
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(popupX, popupY, popupWidth, popupHeight);
    
    // Border
    ctx.strokeStyle = '#4a6a8a';
    ctx.lineWidth = 4;
    ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);
    
    // Inner border
    ctx.strokeStyle = '#2a4a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(popupX + 5, popupY + 5, popupWidth - 10, popupHeight - 10);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT WEAPON TO REPLACE', this.width / 2, popupY + 40);
    
    // New weapon info
    const newWeapon = weaponSwapData.weapon;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`NEW: ${newWeapon.name.toUpperCase()}`, this.width / 2, popupY + 80);
    ctx.fillStyle = '#ffff00';
    ctx.font = '14px monospace';
    ctx.fillText(`DMG: ${newWeapon.damage} | RATE: ${newWeapon.fireRate}ms | AMMO: ${newWeapon.ammoCapacity}`, 
                 this.width / 2, popupY + 105);
    
    // Current weapons
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('YOUR CURRENT WEAPONS:', this.width / 2, popupY + 140);
    
    // List current weapons
    const startY = popupY + 170;
    const spacing = 50;
    
    // Get all player weapons (ranged + melee)
    const allWeapons = [...player.rangedWeapons];
    if (player.meleeWeapon) {
      allWeapons.push(player.meleeWeapon);
    }
    
    allWeapons.forEach((weapon, index) => {
      const yPos = startY + index * spacing;
      const isCurrentWeapon = index === player.currentRangedWeaponIndex && !weapon.isMelee;
      
      // Highlight current weapon
      if (isCurrentWeapon) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fillRect(popupX + 20, yPos - 20, popupWidth - 40, 40);
      }
      
      // Weapon slot number
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`[${index + 1}]`, popupX + 40, yPos);
      
      // Weapon name
      ctx.fillStyle = isCurrentWeapon ? '#ffff00' : '#ffffff';
      ctx.fillText(weapon.name.toUpperCase(), popupX + 100, yPos);
      
      // Weapon stats
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '14px monospace';
      const meleeTag = weapon.isMelee ? ' [MELEE]' : '';
      ctx.fillText(`DMG: ${weapon.damage} | RATE: ${weapon.fireRate}ms | AMMO: ${weapon.ammoCapacity}${meleeTag}`, 
                   popupX + 300, yPos);
    });
    
    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press [1-4] to replace that weapon | [ESC] to cancel', this.width / 2, popupY + 370);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }
  
  drawInventory(ctx, player) {
    ctx.save();
    
    // Semi-transparent background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Inventory panel
    const panelWidth = 700;
    const panelHeight = 450;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;
    
    // 16-bit style panel
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Border
    ctx.strokeStyle = '#4a6a8a';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Inner border
    ctx.strokeStyle = '#2a4a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 5, panelY + 5, panelWidth - 10, panelHeight - 10);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INVENTORY', this.width / 2, panelY + 45);
    
    // Subtitle
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px monospace';
    ctx.fillText('YOUR WEAPONS', this.width / 2, panelY + 75);
    
    // List weapons
    const startY = panelY + 110;
    const spacing = 70;
    
    // Get all player weapons (ranged + melee)
    const allWeapons = [...player.rangedWeapons];
    if (player.meleeWeapon) {
      allWeapons.push(player.meleeWeapon);
    }
    
    ctx.textAlign = 'left';
    allWeapons.forEach((weapon, index) => {
      const yPos = startY + index * spacing;
      const isCurrentWeapon = index === player.currentRangedWeaponIndex && !weapon.isMelee;
      
      // Highlight current weapon
      if (isCurrentWeapon) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.fillRect(panelX + 20, yPos - 25, panelWidth - 40, 60);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 20, yPos - 25, panelWidth - 40, 60);
      }
      
      // Weapon number
      ctx.fillStyle = isCurrentWeapon ? '#ffff00' : '#00ff00';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`[${index + 1}]`, panelX + 40, yPos);
      
      // Weapon name
      ctx.fillStyle = isCurrentWeapon ? '#00ffff' : '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(weapon.name.toUpperCase(), panelX + 90, yPos);
      
      // Current weapon indicator
      if (isCurrentWeapon) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('◄ EQUIPPED', panelX + 90 + ctx.measureText(weapon.name.toUpperCase()).width + 15, yPos);
      }
      
      // Weapon stats
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '14px monospace';
      const ammoText = weapon.currentAmmo === 999 ? 'INFINITE' : `${weapon.currentAmmo}/${weapon.ammoCapacity}`;
      const meleeTag = weapon.isMelee ? ' [MELEE]' : '';
      ctx.fillText(`DMG: ${weapon.damage} | RATE: ${weapon.fireRate}ms | AMMO: ${ammoText}${meleeTag}`, 
                   panelX + 90, yPos + 22);
      
      // Reload status
      if (weapon.isReloading) {
        ctx.fillStyle = '#ff6600';
        ctx.font = '12px monospace';
        ctx.fillText('RELOADING...', panelX + 550, yPos + 22);
      }
    });
    
    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press [1-4] to equip weapon | [I] or [ESC] to close', this.width / 2, panelY + panelHeight - 30);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }
}
