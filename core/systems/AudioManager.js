// Advanced audio system using Web Audio API with procedural sound generation
class AudioManager {
  constructor() {
    this.enabled = true;
    this.masterVolume = 1.0;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.7;
    this.soundLog = [];  // Log sounds for debugging
    
    // Music system - initialize before initAudioContext
    this.currentMusic = null;
    this.musicGainNode = null;
    this.musicOscillators = [];
    
    // Initialize Web Audio API (this will set musicGainNode)
    this.audioContext = null;
    this.initAudioContext();
    
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
      // Don't use { once: true } so it can trigger multiple times if needed
      const resumeHandler = () => this.resumeAudioContext();
      document.addEventListener('click', resumeHandler);
      document.addEventListener('keydown', resumeHandler);
      document.addEventListener('touchstart', resumeHandler);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      this.enabled = false;
    }
  }
  
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed successfully');
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
    if (!this.enabled || !this.audioContext) {
      console.warn('Audio not enabled or context not initialized');
      return;
    }
    
    // Don't restart the same music
    if (this.currentMusic === musicName) {
      console.log('Music already playing:', musicName);
      return;
    }
    
    // Resume audio context if needed
    await this.resumeAudioContext();
    
    // Check if audio context is running
    if (this.audioContext.state !== 'running') {
      console.warn('Audio context not running, current state:', this.audioContext.state);
      // Try to resume again
      await this.resumeAudioContext();
    }
    
    // ALWAYS stop current music before starting new music
    this.stopMusic();
    
    // Set current music AFTER stopping to prevent race conditions
    this.currentMusic = musicName;
    
    // Start new music based on name
    try {
      console.log('Starting music:', musicName);
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
          console.warn('Unknown music name:', musicName);
          this.currentMusic = null;
          break;
      }
    } catch (e) {
      console.error('Error playing music:', e);
      // Disable music on error
      this.currentMusic = null;
    }
  }
  
  playMenuMusic() {
    // Ambient menu music with chord progression and melody
    const ctx = this.audioContext;
    
    // Bass line (root notes of chord progression: Am - F - C - G)
    const bassNotes = [
      { freq: 110, time: 0, duration: 1 },      // A
      { freq: 87.31, time: 1, duration: 1 },    // F
      { freq: 130.81, time: 2, duration: 1 },   // C
      { freq: 98, time: 3, duration: 1 }        // G
    ];
    
    // Melody notes (played on top)
    const melodyNotes = [
      { freq: 440, time: 0, duration: 0.5 },    // A
      { freq: 523.25, time: 0.5, duration: 0.5 }, // C
      { freq: 349.23, time: 1, duration: 0.5 },   // F
      { freq: 440, time: 1.5, duration: 0.5 },    // A
      { freq: 523.25, time: 2, duration: 0.5 },   // C
      { freq: 587.33, time: 2.5, duration: 0.5 }, // D
      { freq: 392, time: 3, duration: 0.5 },      // G
      { freq: 493.88, time: 3.5, duration: 0.5 }  // B
    ];
    
    // Store music name for setTimeout callbacks
    const currentMusicName = this.currentMusic;
    
    // Create bass loop
    this.createMusicLoop(bassNotes, 4, 'square', 0.12);
    
    // Create melody loop (slightly delayed for depth)
    setTimeout(() => {
      if (this.currentMusic === currentMusicName) {
        this.createMusicLoop(melodyNotes, 4, 'sine', 0.08);
      }
    }, 50);
  }
  
  playGameplayMusic() {
    // Energetic gameplay music - fast-paced action theme
    const ctx = this.audioContext;
    
    // Driving bass line
    const bassNotes = [
      { freq: 164.81, time: 0, duration: 0.25 },    // E
      { freq: 164.81, time: 0.25, duration: 0.25 }, // E
      { freq: 164.81, time: 0.5, duration: 0.25 },  // E
      { freq: 196, time: 0.75, duration: 0.25 },    // G
      { freq: 164.81, time: 1, duration: 0.25 },    // E
      { freq: 164.81, time: 1.25, duration: 0.25 }, // E
      { freq: 146.83, time: 1.5, duration: 0.25 },  // D
      { freq: 164.81, time: 1.75, duration: 0.25 }  // E
    ];
    
    // Energetic melody
    const melodyNotes = [
      { freq: 659.25, time: 0, duration: 0.25 },    // E
      { freq: 783.99, time: 0.25, duration: 0.25 }, // G
      { freq: 659.25, time: 0.5, duration: 0.25 },  // E
      { freq: 587.33, time: 0.75, duration: 0.25 }, // D
      { freq: 659.25, time: 1, duration: 0.25 },    // E
      { freq: 783.99, time: 1.25, duration: 0.25 }, // G
      { freq: 880, time: 1.5, duration: 0.25 },     // A
      { freq: 783.99, time: 1.75, duration: 0.25 }  // G
    ];
    
    // Harmony notes
    const harmonyNotes = [
      { freq: 523.25, time: 0, duration: 0.5 },     // C
      { freq: 493.88, time: 0.5, duration: 0.5 },   // B
      { freq: 523.25, time: 1, duration: 0.5 },     // C
      { freq: 587.33, time: 1.5, duration: 0.5 }    // D
    ];
    
    // Store music name for setTimeout callbacks
    const currentMusicName = this.currentMusic;
    
    // Create bass loop (square wave for punchier sound)
    this.createMusicLoop(bassNotes, 2, 'square', 0.15);
    
    // Create melody loop
    setTimeout(() => {
      if (this.currentMusic === currentMusicName) {
        this.createMusicLoop(melodyNotes, 2, 'square', 0.1);
      }
    }, 50);
    
    // Create harmony loop
    setTimeout(() => {
      if (this.currentMusic === currentMusicName) {
        this.createMusicLoop(harmonyNotes, 2, 'triangle', 0.06);
      }
    }, 100);
  }
  
  playBossMusic() {
    // Intense boss music - aggressive and dramatic
    const ctx = this.audioContext;
    
    // Heavy bass line (dark and threatening)
    const bassNotes = [
      { freq: 110, time: 0, duration: 0.2 },      // A
      { freq: 110, time: 0.2, duration: 0.2 },    // A
      { freq: 116.54, time: 0.4, duration: 0.2 }, // A#
      { freq: 110, time: 0.6, duration: 0.2 },    // A
      { freq: 98, time: 0.8, duration: 0.2 },     // G
      { freq: 110, time: 1, duration: 0.2 },      // A
      { freq: 110, time: 1.2, duration: 0.2 },    // A
      { freq: 103.83, time: 1.4, duration: 0.2 }, // G#
      { freq: 110, time: 1.6, duration: 0.2 },    // A
      { freq: 116.54, time: 1.8, duration: 0.2 }  // A#
    ];
    
    // Aggressive melody (high intensity)
    const melodyNotes = [
      { freq: 440, time: 0, duration: 0.15 },     // A
      { freq: 554.37, time: 0.15, duration: 0.15 }, // C#
      { freq: 440, time: 0.3, duration: 0.15 },   // A
      { freq: 466.16, time: 0.45, duration: 0.15 }, // A#
      { freq: 440, time: 0.6, duration: 0.15 },   // A
      { freq: 392, time: 0.75, duration: 0.15 },  // G
      { freq: 440, time: 0.9, duration: 0.2 },    // A
      { freq: 554.37, time: 1.1, duration: 0.15 }, // C#
      { freq: 587.33, time: 1.25, duration: 0.15 }, // D
      { freq: 554.37, time: 1.4, duration: 0.15 }, // C#
      { freq: 493.88, time: 1.55, duration: 0.15 }, // B
      { freq: 440, time: 1.7, duration: 0.3 }     // A
    ];
    
    // Power chord harmony
    const harmonyNotes = [
      { freq: 330, time: 0, duration: 0.4 },      // E (power chord)
      { freq: 349.23, time: 0.4, duration: 0.4 }, // F
      { freq: 293.66, time: 0.8, duration: 0.4 }, // D
      { freq: 330, time: 1.2, duration: 0.4 },    // E
      { freq: 349.23, time: 1.6, duration: 0.4 }  // F
    ];
    
    // Store music name for setTimeout callbacks
    const currentMusicName = this.currentMusic;
    
    // Create heavy bass loop
    this.createMusicLoop(bassNotes, 2, 'sawtooth', 0.18);
    
    // Create aggressive melody loop
    setTimeout(() => {
      if (this.currentMusic === currentMusicName) {
        this.createMusicLoop(melodyNotes, 2, 'square', 0.12);
      }
    }, 50);
    
    // Create power chord harmony
    setTimeout(() => {
      if (this.currentMusic === currentMusicName) {
        this.createMusicLoop(harmonyNotes, 2, 'sawtooth', 0.08);
      }
    }, 100);
  }
  
  playVictoryMusic() {
    // Victory fanfare - triumphant and celebratory
    const ctx = this.audioContext;
    const startTime = ctx.currentTime;
    
    // Main fanfare melody
    const mainMelody = [
      { freq: 523.25, time: 0, duration: 0.25 },    // C
      { freq: 523.25, time: 0.25, duration: 0.25 }, // C
      { freq: 523.25, time: 0.5, duration: 0.25 },  // C
      { freq: 659.25, time: 0.75, duration: 0.5 },  // E
      { freq: 783.99, time: 1.25, duration: 0.25 }, // G
      { freq: 1046.5, time: 1.5, duration: 0.75 }   // C (high)
    ];
    
    // Harmony notes
    const harmony = [
      { freq: 329.63, time: 0, duration: 0.75 },    // E
      { freq: 392, time: 0.75, duration: 0.5 },     // G
      { freq: 493.88, time: 1.25, duration: 0.25 }, // B
      { freq: 659.25, time: 1.5, duration: 0.75 }   // E (high)
    ];
    
    // Bass support
    const bass = [
      { freq: 130.81, time: 0, duration: 0.75 },  // C
      { freq: 196, time: 0.75, duration: 0.5 },   // G
      { freq: 261.63, time: 1.25, duration: 1 }   // C
    ];
    
    // Play main melody
    mainMelody.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'square';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
      
      this.musicOscillators.push(osc);
    });
    
    // Play harmony
    harmony.forEach(note => {
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
      
      this.musicOscillators.push(osc);
    });
    
    // Play bass
    bass.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
      
      this.musicOscillators.push(osc);
    });
  }
  
  playGameOverMusic() {
    // Sad game over music - descending progression
    const ctx = this.audioContext;
    const startTime = ctx.currentTime;
    
    // Descending melody (defeat theme)
    const melody = [
      { freq: 329.63, time: 0, duration: 0.4 },    // E
      { freq: 293.66, time: 0.4, duration: 0.4 },  // D
      { freq: 261.63, time: 0.8, duration: 0.4 },  // C
      { freq: 246.94, time: 1.2, duration: 0.4 },  // B
      { freq: 220, time: 1.6, duration: 0.8 }      // A
    ];
    
    // Harmony notes (minor feel)
    const harmony = [
      { freq: 261.63, time: 0, duration: 0.4 },    // C
      { freq: 246.94, time: 0.4, duration: 0.4 },  // B
      { freq: 220, time: 0.8, duration: 0.4 },     // A
      { freq: 196, time: 1.2, duration: 0.4 },     // G
      { freq: 174.61, time: 1.6, duration: 0.8 }   // F
    ];
    
    // Bass notes
    const bass = [
      { freq: 164.81, time: 0, duration: 0.8 },  // E
      { freq: 130.81, time: 0.8, duration: 0.8 }, // C
      { freq: 110, time: 1.6, duration: 0.8 }    // A
    ];
    
    // Play melody
    melody.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'sine';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
      
      this.musicOscillators.push(osc);
    });
    
    // Play harmony
    harmony.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
      
      this.musicOscillators.push(osc);
    });
    
    // Play bass
    bass.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      const time = startTime + note.time;
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.start(time);
      osc.stop(time + note.duration);
      
      this.musicOscillators.push(osc);
    });
  }
  
  createMusicLoop(notes, loopDuration, waveform = 'square', volume = 0.08) {
    if (!this.audioContext) {
      console.warn('Cannot create music loop: audio context not available');
      return;
    }
    
    if (!this.musicGainNode) {
      console.warn('Cannot create music loop: music gain node not available');
      return;
    }
    
    if (this.audioContext.state !== 'running') {
      console.warn('Cannot create music loop: audio context not running, state:', this.audioContext.state);
      return;
    }
    
    const ctx = this.audioContext;
    let startTime = ctx.currentTime;
    
    // Store the music name at the time of loop creation to check if it's still active
    const musicNameAtCreation = this.currentMusic;
    
    const playLoop = () => {
      // Check if this music is still supposed to be playing
      if (this.currentMusic !== musicNameAtCreation || this.currentMusic === null || !this.musicGainNode) {
        return;
      }
      
      if (ctx.state !== 'running') {
        console.warn('Audio context stopped running, stopping music loop');
        return;
      }
      
      try {
        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(this.musicGainNode);
          
          osc.type = waveform;
          osc.frequency.value = note.freq;
          
          const time = startTime + note.time;
          gain.gain.setValueAtTime(volume, time);
          gain.gain.setValueAtTime(volume, time + note.duration - 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
          
          osc.start(time);
          osc.stop(time + note.duration);
          
          this.musicOscillators.push(osc);
        });
        
        startTime += loopDuration;
        
        // Schedule next loop - check again before scheduling
        setTimeout(() => {
          if (this.currentMusic === musicNameAtCreation) {
            playLoop();
          }
        }, loopDuration * 1000 - 100);
      } catch (e) {
        console.error('Error in music loop:', e);
        if (this.currentMusic === musicNameAtCreation) {
          this.currentMusic = null;
        }
      }
    };
    
    playLoop();
  }
  
  stopMusic() {
    console.log('Stopping music, current music was:', this.currentMusic);
    
    // Clear current music first to stop any pending loops
    this.currentMusic = null;
    
    // Stop all music oscillators
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped or disconnected
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
