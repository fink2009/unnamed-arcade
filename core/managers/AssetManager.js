// Manages loading and caching of assets (sprites, sounds)
class AssetManager {
  constructor() {
    this.images = {};
    this.sounds = {};
    this.loaded = false;
  }

  loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[name] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  loadSound(name, src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.sounds[name] = audio;
        resolve(audio);
      };
      audio.onerror = reject;
      audio.src = src;
    });
  }

  getImage(name) {
    return this.images[name];
  }

  getSound(name) {
    return this.sounds[name];
  }

  playSound(name, volume = 1.0) {
    const sound = this.sounds[name];
    if (sound) {
      const clone = sound.cloneNode();
      clone.volume = volume;
      clone.play().catch(e => console.log('Sound play failed:', e));
    }
  }
}
