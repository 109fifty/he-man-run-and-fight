export class Input {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    this.touch = {
      left: false,
      right: false,
      down: false,
      up: false,
      sink: false,
      run: false,
      jump: false,
      punch: false,
      fire: false,
      kick: false,
      start: false,
      restart: false,
    };
    this._holdPointers = new Map(); // pointerId -> action
    this._onDown = (e) => this._down(e);
    this._onUp = (e) => this._up(e);
    this._onBlur = () => this.releaseAll();
    window.addEventListener("keydown", this._onDown);
    window.addEventListener("keyup", this._onUp);
    window.addEventListener("blur", this._onBlur);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.releaseAll();
    });
    this._bindTouchPad();
  }

  releaseAll() {
    this.keys.clear();
    this.justPressed.clear();
    for (const k of Object.keys(this.touch)) this.touch[k] = false;
    this._holdPointers.clear();
    document.querySelectorAll(".pad-btn.active").forEach((el) => {
      el.classList.remove("active");
    });
  }

  _bindTouchPad() {
    const root = document.getElementById("touch-pad");
    if (!root) return;

    const setHold = (action, on) => {
      if (!(action in this.touch)) return;
      this.touch[action] = on;
    };

    const bind = (el) => {
      const action = el.dataset.action;
      const mode = el.dataset.mode || "hold";
      if (!action) return;

      const start = (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add("active");
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
        if (mode === "tap") {
          this.touch[action] = true;
        } else {
          this._holdPointers.set(e.pointerId, action);
          setHold(action, true);
        }
      };

      const end = (e) => {
        e.preventDefault();
        el.classList.remove("active");
        try {
          if (el.hasPointerCapture?.(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
          }
        } catch (_) {
          /* ignore */
        }
        if (mode !== "tap") {
          const held = this._holdPointers.get(e.pointerId);
          if (held) {
            setHold(held, false);
            this._holdPointers.delete(e.pointerId);
          } else {
            setHold(action, false);
          }
        }
      };

      el.addEventListener("pointerdown", start);
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    };

    root.querySelectorAll("[data-action]").forEach(bind);

    root.addEventListener(
      "touchmove",
      (e) => e.preventDefault(),
      { passive: false }
    );

    window.addEventListener("pointerup", (e) => {
      const held = this._holdPointers.get(e.pointerId);
      if (!held) return;
      setHold(held, false);
      this._holdPointers.delete(e.pointerId);
    });
  }

  _down(e) {
    const k = e.code;
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Space",
        "ShiftLeft",
        "ShiftRight",
      ].includes(k)
    ) {
      e.preventDefault();
    }
    if (!this.keys.has(k)) this.justPressed.add(k);
    this.keys.add(k);
  }

  _up(e) {
    this.keys.delete(e.code);
  }

  pressed(code) {
    return this.keys.has(code);
  }

  tap(code) {
    return this.justPressed.has(code);
  }

  left() {
    return this.pressed("ArrowLeft") || this.pressed("KeyA") || this.touch.left;
  }

  right() {
    return this.pressed("ArrowRight") || this.pressed("KeyD") || this.touch.right;
  }

  down() {
    return this.pressed("ArrowDown") || this.pressed("KeyS") || this.touch.down;
  }

  /** Flug: bremsen (Touch STOP / C) */
  brake() {
    return this.touch.down || this.pressed("KeyC") || this.pressed("ControlLeft");
  }

  /** Flug: steigen (halten) */
  up() {
    return this.pressed("ArrowUp") || this.pressed("KeyW") || this.touch.up;
  }

  /** Flug: sinken (halten) */
  sink() {
    return this.pressed("ArrowDown") || this.pressed("KeyS") || this.touch.sink;
  }

  jump() {
    return this.tap("Space") || this.tap("ArrowUp") || this.tap("KeyW") || this.touch.jump;
  }

  run() {
    return (
      this.pressed("ShiftLeft") ||
      this.pressed("ShiftRight") ||
      this.touch.run
    );
  }

  punch() {
    return this.tap("KeyJ") || this.tap("KeyX") || this.touch.punch;
  }

  /** Flug: Dauerschuss bei gehaltener Taste */
  fireHeld() {
    return (
      this.pressed("KeyJ") ||
      this.pressed("KeyX") ||
      this.touch.fire ||
      this.touch.punch
    );
  }

  /** Flug: Schuss-Tap (Fallback) */
  shoot() {
    return this.tap("Space") || this.touch.punch || this.touch.fire;
  }

  kick() {
    return this.tap("KeyK") || this.tap("KeyZ") || this.touch.kick;
  }

  start() {
    return this.tap("Enter") || this.tap("Space") || this.touch.start;
  }

  restart() {
    return this.tap("KeyR") || this.touch.restart;
  }

  endFrame() {
    this.justPressed.clear();
    this.touch.jump = false;
    this.touch.punch = false;
    this.touch.kick = false;
    this.touch.start = false;
    this.touch.restart = false;
  }

  destroy() {
    window.removeEventListener("keydown", this._onDown);
    window.removeEventListener("keyup", this._onUp);
    window.removeEventListener("blur", this._onBlur);
  }
}
