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
    
    // Score
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`SCORE: ${gameState.score}`, this.width - 150, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`KILLS: ${gameState.kills}`, this.width - 150, 40);
    
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
    
    // Combo indicator
    if (gameState.combo > 1) {
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${gameState.combo}X COMBO!`, this.width / 2 - 60, 50);
    }
    
    // Wave/Level info
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
    
    ctx.restore();
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
        ctx.font = '16px monospace';
        
        const autoReload = window.game && window.game.autoReload ? 'ON' : 'OFF';
        ctx.fillText(`1 - Auto Reload [${autoReload}]`, this.width / 2, 200);
        
        const colorBlind = window.game ? window.game.colorBlindMode.toUpperCase() : 'NONE';
        ctx.fillText(`2 - Color Blind Mode [${colorBlind}]`, this.width / 2, 230);
        
        ctx.fillStyle = '#888';
        ctx.font = '14px monospace';
        ctx.fillText('More options coming soon...', this.width / 2, 300);
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
        '  Shift - Roll/Dodge',
        '',
        'COMBAT:',
        '  Mouse - Aim',
        '  Left Click - Shoot',
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
}
