// Manages keyboard and mouse input
class InputManager {
  constructor() {
    this.keys = {};
    this.keysPressed = {}; // Track keys that were pressed this frame
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = {};
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.key]) {
        this.keysPressed[e.key] = true;
        this.keysPressed[e.code] = true;
      }
      this.keys[e.key] = true;
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.keys[e.code] = false;
    });

    window.addEventListener('mousemove', (e) => {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
    });

    window.addEventListener('mousedown', (e) => {
      this.mouseButtons[e.button] = true;
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons[e.button] = false;
    });

    // Prevent context menu on right-click (button 2) so it doesn't interfere with gameplay
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  isKeyPressed(key) {
    return this.keys[key] === true;
  }

  wasKeyPressed(key) {
    // Check if key was pressed this frame (for menu navigation)
    return this.keysPressed[key] === true;
  }

  isMouseButtonPressed(button) {
    return this.mouseButtons[button] === true;
  }

  getMousePosition() {
    return { ...this.mousePos };
  }

  clearPressedKeys() {
    // Clear pressed keys at end of frame
    this.keysPressed = {};
  }
}
