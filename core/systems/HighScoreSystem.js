// High Score tracking system using localStorage
class HighScoreSystem {
  constructor() {
    this.highScores = this.loadHighScores();
    this.maxScores = 10;
  }
  
  loadHighScores() {
    try {
      const stored = localStorage.getItem('arcadeHighScores');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load high scores:', e);
    }
    return [];
  }
  
  saveHighScores() {
    try {
      localStorage.setItem('arcadeHighScores', JSON.stringify(this.highScores));
    } catch (e) {
      console.warn('Could not save high scores:', e);
    }
  }
  
  addScore(score, character, difficulty, mode, stats) {
    const entry = {
      score: score,
      character: character,
      difficulty: difficulty,
      mode: mode,
      date: new Date().toISOString(),
      kills: stats.kills || 0,
      wave: stats.wave || 0,
      accuracy: stats.accuracy || 0
    };
    
    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, this.maxScores);
    this.saveHighScores();
    
    return this.getRank(score);
  }
  
  getRank(score) {
    for (let i = 0; i < this.highScores.length; i++) {
      if (this.highScores[i].score === score) {
        return i + 1;
      }
    }
    return -1;
  }
  
  isHighScore(score) {
    if (this.highScores.length < this.maxScores) return true;
    return score > this.highScores[this.highScores.length - 1].score;
  }
  
  getTopScores(count = 10) {
    return this.highScores.slice(0, count);
  }
  
  clearScores() {
    this.highScores = [];
    this.saveHighScores();
  }
}
