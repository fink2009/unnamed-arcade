// Achievement/Milestone tracking system
class Achievement {
  constructor(id, name, description, condition) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.condition = condition;
    this.unlocked = false;
    this.unlockedTime = null;
  }
  
  check(gameState) {
    if (!this.unlocked && this.condition(gameState)) {
      this.unlocked = true;
      this.unlockedTime = Date.now();
      return true;
    }
    return false;
  }
}

class AchievementSystem {
  constructor() {
    this.achievements = [];
    this.recentUnlocks = [];
    this.initializeAchievements();
  }
  
  initializeAchievements() {
    this.achievements = [
      new Achievement('first_blood', 'First Blood', 'Kill your first enemy', 
        (g) => g.kills >= 1),
      new Achievement('killer', 'Killer', 'Kill 10 enemies', 
        (g) => g.kills >= 10),
      new Achievement('massacre', 'Massacre', 'Kill 50 enemies', 
        (g) => g.kills >= 50),
      new Achievement('legend', 'Legend', 'Kill 100 enemies', 
        (g) => g.kills >= 100),
      new Achievement('combo_starter', 'Combo Starter', 'Achieve a 3x combo', 
        (g) => g.maxCombo >= 3),
      new Achievement('combo_master', 'Combo Master', 'Achieve a 10x combo', 
        (g) => g.maxCombo >= 10),
      new Achievement('survivor', 'Survivor', 'Reach wave 5', 
        (g) => g.wave >= 5 && g.mode === 'survival'),
      new Achievement('veteran', 'Veteran', 'Reach wave 10', 
        (g) => g.wave >= 10 && g.mode === 'survival'),
      new Achievement('marksman', 'Marksman', 'Achieve 75% accuracy', 
        (g) => g.shotsFired > 20 && (g.shotsHit / g.shotsFired) >= 0.75),
      new Achievement('sharpshooter', 'Sharpshooter', 'Achieve 90% accuracy', 
        (g) => g.shotsFired > 50 && (g.shotsHit / g.shotsFired) >= 0.90),
      new Achievement('boss_slayer', 'Boss Slayer', 'Defeat a boss enemy', 
        (g) => g.bossesKilled >= 1),
      new Achievement('untouchable', 'Untouchable', 'Complete a wave without taking damage', 
        (g) => g.damageTakenThisWave === 0 && g.wave > 1),
      new Achievement('arsenal', 'Arsenal', 'Collect 5 different weapons', 
        (g) => g.weaponsCollected >= 5),
      new Achievement('high_roller', 'High Roller', 'Score 10,000 points', 
        (g) => g.score >= 10000),
      new Achievement('millionaire', 'Millionaire', 'Score 100,000 points', 
        (g) => g.score >= 100000),
    ];
  }
  
  update(gameState) {
    const newUnlocks = [];
    this.achievements.forEach(achievement => {
      if (achievement.check(gameState)) {
        newUnlocks.push(achievement);
        this.recentUnlocks.unshift(achievement);
        if (this.recentUnlocks.length > 3) {
          this.recentUnlocks.pop();
        }
      }
    });
    return newUnlocks;
  }
  
  getProgress() {
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    return {
      unlocked: unlocked,
      total: this.achievements.length,
      percentage: (unlocked / this.achievements.length * 100).toFixed(1)
    };
  }
  
  render(ctx, x, y, maxDisplay = 2) {
    if (this.recentUnlocks.length === 0) return;
    
    ctx.save();
    ctx.font = '14px monospace';
    
    for (let i = 0; i < Math.min(maxDisplay, this.recentUnlocks.length); i++) {
      const achievement = this.recentUnlocks[i];
      const age = Date.now() - achievement.unlockedTime;
      
      // Fade out after 5 seconds
      if (age > 5000) continue;
      
      const alpha = Math.max(0, 1 - (age - 3000) / 2000);
      ctx.globalAlpha = alpha;
      
      const displayY = y + (i * 50);
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, displayY, 300, 45);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, displayY, 300, 45);
      
      // Text
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('🏆 Achievement Unlocked!', x + 10, displayY + 18);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(achievement.name, x + 10, displayY + 35);
    }
    
    ctx.restore();
  }
}
