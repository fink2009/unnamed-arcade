// Advanced audio system using Web Audio API with procedural sound generation
class AudioManager {
  constructor() {
    this.enabled = true;
    this.masterVolume = 1.0;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.7;
    this.soundLog = [];  // Log sounds for debugging
    
    // Initialize Web Audio API
    this.audioContext = null;
    this.initAudioContext();
    
    // Music system
    this.currentMusic = null;
    this.musicGainNode = null;
    this.musicOscillators = [];
    
    // Sound cache to prevent too many simultaneous identical sounds
    this.soundTimers = {};
  }
  
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.masterVolume;
      this.masterGainNode.connect(this.audioContext.destination);
      
      // Create music gain node
      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.gain.value = this.musicVolume;
      this.musicGainNode.connect(this.masterGainNode);
      
      // Resume audio context on user interaction (required by browsers)
      document.addEventListener('click', () => this.resumeAudioContext(), { once: true });
      document.addEventListener('keydown', () => this.resumeAudioContext(), { once: true });
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      this.enabled = false;
    }
  }
  
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('Could not resume audio context:', e);
      }
    }
  }
  
  playSound(soundName, volume = 1.0) {
    if (!this.enabled || !this.audioContext) return;
    
    // Throttle identical sounds to prevent audio clipping
    const now = Date.now();
    if (this.soundTimers[soundName] && now - this.soundTimers[soundName] < 50) {
      return; // Too soon to play the same sound again
    }
    this.soundTimers[soundName] = now;
    
    const finalVolume = this.masterVolume * this.sfxVolume * volume;
    
    // Log sound events
    this.soundLog.push({
      name: soundName,
      volume: finalVolume,
      time: now
    });
    
    if (this.soundLog.length > 10) {
      this.soundLog.shift();
    }
    
    // Generate and play sound based on type
    this.generateSound(soundName, finalVolume);
  }
  
  generateSound(soundName, volume) {
    const ctx = this.audioContext;
    const startTime = ctx.currentTime;
    
    // Create sound based on name
    switch (soundName) {
      case 'shoot':
        this.createShootSound(volume, startTime);
        break;
      case 'shoot_pistol':
        this.createPistolSound(volume, startTime);
        break;
      case 'shoot_rifle':
        this.createRifleSound(volume, startTime);
        break;
      case 'shoot_shotgun':
        this.createShotgunSound(volume, startTime);
        break;
      case 'shoot_machinegun':
        this.createMachineGunSound(volume, startTime);
        break;
      case 'shoot_sniper':
        this.createSniperSound(volume, startTime);
        break;
      case 'shoot_grenade':
        this.createGrenadeSound(volume, startTime);
        break;
      case 'shoot_laser':
        this.createLaserSound(volume, startTime);
        break;
      case 'shoot_melee':
        this.createMeleeSound(volume, startTime);
        break;
      case 'explosion':
        this.createExplosionSound(volume, startTime);
        break;
      case 'enemy_hit':
        this.createHitSound(volume, startTime, 'enemy');
        break;
      case 'player_hit':
        this.createHitSound(volume, startTime, 'player');
        break;
      case 'enemy_killed':
        this.createKillSound(volume, startTime);
        break;
      case 'pickup':
        this.createPickupSound(volume, startTime, 'generic');
        break;
      case 'pickup_health':
        this.createPickupSound(volume, startTime, 'health');
        break;
      case 'pickup_ammo':
        this.createPickupSound(volume, startTime, 'ammo');
        break;
      case 'pickup_weapon':
        this.createPickupSound(volume, startTime, 'weapon');
        break;
      case 'pickup_powerup':
        this.createPickupSound(volume, startTime, 'powerup');
        break;
      case 'ability':
        this.createAbilitySound(volume, startTime);
        break;
      case 'ability_airstrike':
        this.createAirstrikeSound(volume, startTime);
        break;
      case 'ability_sprint':
        this.createSprintSound(volume, startTime);
        break;
      case 'ability_shield':
        this.createShieldSound(volume, startTime);
        break;
      case 'ability_medpack':
        this.createMedpackSound(volume, startTime);
        break;
      case 'reload':
        this.createReloadSound(volume, startTime);
        break;
      case 'weapon_switch':
        this.createWeaponSwitchSound(volume, startTime);
        break;
      case 'menu_select':
        this.createMenuSound(volume, startTime, 'select');
        break;
      case 'menu_navigate':
        this.createMenuSound(volume, startTime, 'navigate');
        break;
      case 'cover_destroy':
        this.createCoverDestroySound(volume, startTime);
        break;
      case 'projectile_impact':
        this.createImpactSound(volume, startTime);
        break;
      default:
        this.createDefaultSound(volume, startTime);
    }
  }
  
  // === WEAPON SOUNDS ===
  
  createShootSound(volume, startTime) {
    // Generic gun shot - short burst of noise
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noise = this.createNoiseBuffer(0.05);
    const noiseSource = ctx.createBufferSource();
    
    noiseSource.buffer = noise;
    noiseSource.connect(gain);
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.05);
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
    
    osc.start(startTime);
    noiseSource.start(startTime);
    osc.stop(startTime + 0.05);
    noiseSource.stop(startTime + 0.05);
  }
  
  createPistolSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, startTime);
    osc.frequency.exponentialRampToValueAtTime(60, startTime + 0.04);
    
    gain.gain.setValueAtTime(volume * 0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.04);
    
    osc.start(startTime);
    osc.stop(startTime + 0.04);
  }
  
  createRifleSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.06);
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.06);
    
    osc.start(startTime);
    osc.stop(startTime + 0.06);
  }
  
  createShotgunSound(volume, startTime) {
    const ctx = this.audioContext;
    const noise = this.createNoiseBuffer(0.1);
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noise;
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.1);
    
    gain.gain.setValueAtTime(volume * 0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.1);
  }
  
  createMachineGunSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, startTime);
    osc.frequency.exponentialRampToValueAtTime(55, startTime + 0.03);
    
    gain.gain.setValueAtTime(volume * 0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.03);
    
    osc.start(startTime);
    osc.stop(startTime + 0.03);
  }
  
  createSniperSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);
    
    filter.type = 'highpass';
    filter.frequency.value = 100;
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.12);
    
    gain.gain.setValueAtTime(volume * 0.35, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
    
    osc.start(startTime);
    osc.stop(startTime + 0.12);
  }
  
  createGrenadeSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.08);
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
    
    osc.start(startTime);
    osc.stop(startTime + 0.08);
  }
  
  createLaserSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, startTime);
    osc.frequency.exponentialRampToValueAtTime(400, startTime + 0.15);
    
    gain.gain.setValueAtTime(volume * 0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
  
  createMeleeSound(volume, startTime) {
    const ctx = this.audioContext;
    const noise = this.createNoiseBuffer(0.08);
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noise;
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);
    
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.08);
  }
  
  // === IMPACT & DAMAGE SOUNDS ===
  
  createExplosionSound(volume, startTime) {
    const ctx = this.audioContext;
    const noise = this.createNoiseBuffer(0.5);
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noise;
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, startTime);
    filter.frequency.exponentialRampToValueAtTime(50, startTime + 0.5);
    
    gain.gain.setValueAtTime(volume * 0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.5);
  }
  
  createHitSound(volume, startTime, type) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    if (type === 'enemy') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, startTime);
      osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.1);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, startTime);
      osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.15);
    }
    
    gain.gain.setValueAtTime(volume * 0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + (type === 'enemy' ? 0.1 : 0.15));
    
    osc.start(startTime);
    osc.stop(startTime + (type === 'enemy' ? 0.1 : 0.15));
  }
  
  createKillSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(200, startTime);
    osc1.frequency.exponentialRampToValueAtTime(50, startTime + 0.2);
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(150, startTime);
    osc2.frequency.exponentialRampToValueAtTime(40, startTime + 0.2);
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 0.2);
    osc2.stop(startTime + 0.2);
  }
  
  createImpactSound(volume, startTime) {
    const ctx = this.audioContext;
    const noise = this.createNoiseBuffer(0.05);
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    noiseSource.buffer = noise;
    noiseSource.connect(gain);
    gain.connect(this.masterGainNode);
    
    gain.gain.setValueAtTime(volume * 0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.05);
  }
  
  createCoverDestroySound(volume, startTime) {
    const ctx = this.audioContext;
    const noise = this.createNoiseBuffer(0.3);
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noise;
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, startTime);
    filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.3);
    
    gain.gain.setValueAtTime(volume * 0.35, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.3);
  }
  
  // === PICKUP SOUNDS ===
  
  createPickupSound(volume, startTime, type) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    
    switch (type) {
      case 'health':
        osc.frequency.setValueAtTime(523, startTime);
        osc.frequency.setValueAtTime(659, startTime + 0.05);
        osc.frequency.setValueAtTime(784, startTime + 0.1);
        break;
      case 'ammo':
        osc.frequency.setValueAtTime(440, startTime);
        osc.frequency.setValueAtTime(554, startTime + 0.05);
        break;
      case 'weapon':
        osc.frequency.setValueAtTime(330, startTime);
        osc.frequency.setValueAtTime(440, startTime + 0.05);
        osc.frequency.setValueAtTime(554, startTime + 0.1);
        break;
      case 'powerup':
        osc.frequency.setValueAtTime(440, startTime);
        osc.frequency.setValueAtTime(554, startTime + 0.04);
        osc.frequency.setValueAtTime(659, startTime + 0.08);
        osc.frequency.setValueAtTime(880, startTime + 0.12);
        break;
      default:
        osc.frequency.setValueAtTime(440, startTime);
        osc.frequency.setValueAtTime(554, startTime + 0.05);
    }
    
    gain.gain.setValueAtTime(volume * 0.25, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }
  
  // === ABILITY SOUNDS ===
  
  createAbilitySound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, startTime);
    osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.2);
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }
  
  createAirstrikeSound(volume, startTime) {
    const ctx = this.audioContext;
    const noise = this.createNoiseBuffer(0.8);
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noise;
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.8);
    
    gain.gain.setValueAtTime(volume * 0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.8);
  }
  
  createSprintSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, startTime);
    osc.frequency.exponentialRampToValueAtTime(400, startTime + 0.15);
    
    gain.gain.setValueAtTime(volume * 0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
  
  createShieldSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, startTime);
    osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.3);
    
    gain.gain.setValueAtTime(volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }
  
  createMedpackSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659, startTime);
    osc.frequency.setValueAtTime(784, startTime + 0.08);
    
    gain.gain.setValueAtTime(volume * 0.25, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }
  
  // === UI SOUNDS ===
  
  createReloadSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(220, startTime);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(220, startTime + 0.1);
    
    gain.gain.setValueAtTime(volume * 0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.3);
    
    osc1.start(startTime);
    osc1.stop(startTime + 0.1);
    osc2.start(startTime + 0.1);
    osc2.stop(startTime + 0.3);
  }
  
  createWeaponSwitchSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(330, startTime);
    osc.frequency.setValueAtTime(440, startTime + 0.05);
    
    gain.gain.setValueAtTime(volume * 0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.1);
    
    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }
  
  createMenuSound(volume, startTime, type) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    
    if (type === 'select') {
      osc.frequency.setValueAtTime(440, startTime);
      osc.frequency.setValueAtTime(554, startTime + 0.05);
    } else {
      osc.frequency.setValueAtTime(330, startTime);
    }
    
    gain.gain.setValueAtTime(volume * 0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.08);
    
    osc.start(startTime);
    osc.stop(startTime + 0.08);
  }
  
  createDefaultSound(volume, startTime) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    
    osc.type = 'sine';
    osc.frequency.value = 440;
    
    gain.gain.setValueAtTime(volume * 0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    
    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }
  
  // === MUSIC SYSTEM ===
  
  async playMusic(musicName) {
    if (!this.enabled || !this.audioContext) return;
    
    // Resume audio context if needed
    await this.resumeAudioContext();
    
    // Stop current music
    this.stopMusic();
    
    this.currentMusic = musicName;
    
    // Start new music based on name
    try {
      switch (musicName) {
        case 'menu':
          this.playMenuMusic();
          break;
        case 'gameplay':
          this.playGameplayMusic();
          break;
        case 'boss':
          this.playBossMusic();
          break;
        case 'victory':
          this.playVictoryMusic();
          break;
        case 'gameover':
          this.playGameOverMusic();
          break;
        default:
          // No music
          break;
      }
    } catch (e) {
      console.warn('Error playing music:', e);
      // Disable music on error
      this.currentMusic = null;
    }
  }
  
  playMenuMusic() {
    // Simple ambient menu music
    const ctx = this.audioContext;
    const startTime = ctx.currentTime;
    
    // Create a simple chord progression loop
    this.createMusicLoop([
      { freq: 220, time: 0, duration: 1 },
      { freq: 165, time: 1, duration: 1 },
      { freq: 196, time: 2, duration: 1 },
      { freq: 147, time: 3, duration: 1 }
    ], 4);
  }
  
  playGameplayMusic() {
    // Energetic gameplay music
    const ctx = this.audioContext;
    
    this.createMusicLoop([
      { freq: 330, time: 0, duration: 0.5 },
      { freq: 440, time: 0.5, duration: 0.5 },
      { freq: 330, time: 1, duration: 0.5 },
      { freq: 294, time: 1.5, duration: 0.5 },
      { freq: 330, time: 2, duration: 0.5 },
      { freq: 440, time: 2.5, duration: 0.5 },
      { freq: 330, time: 3, duration: 0.5 },
      { freq: 294, time: 3.5, duration: 0.5 }
    ], 4);
  }
  
  playBossMusic() {
    // Intense boss music
    const ctx = this.audioContext;
    
    this.createMusicLoop([
      { freq: 220, time: 0, duration: 0.25 },
      { freq: 277, time: 0.25, duration: 0.25 },
      { freq: 220, time: 0.5, duration: 0.25 },
      { freq: 185, time: 0.75, duration: 0.25 },
      { freq: 220, time: 1, duration: 0.25 },
      { freq: 277, time: 1.25, duration: 0.25 },
      { freq: 330, time: 1.5, duration: 0.5 }
    ], 2);
  }
  
  playVictoryMusic() {
    // Victory fanfare
    const ctx = this.audioContext;
    const startTime = ctx.currentTime;
    
    const notes = [
      { freq: 523, time: 0, duration: 0.3 },
      { freq: 659, time: 0.3, duration: 0.3 },
      { freq: 784, time: 0.6, duration: 0.3 },
      { freq: 1047, time: 0.9, duration: 0.6 }
    ];
    
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'square';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
    });
  }
  
  playGameOverMusic() {
    // Sad game over music
    const ctx = this.audioContext;
    const startTime = ctx.currentTime;
    
    const notes = [
      { freq: 330, time: 0, duration: 0.4 },
      { freq: 294, time: 0.4, duration: 0.4 },
      { freq: 262, time: 0.8, duration: 0.4 },
      { freq: 220, time: 1.2, duration: 0.8 }
    ];
    
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'sine';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
    });
  }
  
  createMusicLoop(notes, loopDuration) {
    if (!this.audioContext || !this.musicGainNode) return;
    
    const ctx = this.audioContext;
    let startTime = ctx.currentTime;
    
    const playLoop = () => {
      if (this.currentMusic === null || !this.musicGainNode) return;
      
      try {
        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(this.musicGainNode);
          
          osc.type = 'square';
          osc.frequency.value = note.freq;
          
          const time = startTime + note.time;
          gain.gain.setValueAtTime(0.08, time);
          gain.gain.setValueAtTime(0.08, time + note.duration - 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
          
          osc.start(time);
          osc.stop(time + note.duration);
          
          this.musicOscillators.push(osc);
        });
        
        startTime += loopDuration;
        
        // Schedule next loop
        setTimeout(playLoop, loopDuration * 1000 - 100);
      } catch (e) {
        console.warn('Error in music loop:', e);
        this.currentMusic = null;
      }
    };
    
    playLoop();
  }
  
  stopMusic() {
    this.currentMusic = null;
    
    // Stop all music oscillators
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.musicOscillators = [];
  }
  
  // === UTILITY FUNCTIONS ===
  
  createNoiseBuffer(duration) {
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume;
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }
}
