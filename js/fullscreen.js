/**
 * Spiel-Vollbild: Fullscreen-API + CSS-Play-Focus.
 * Schließen nur über versteckte Ecke oben links (lang halten → X).
 */
export class FullscreenUI {
  constructor() {
    this.root = document.documentElement;
    this.app = document.querySelector(".app");
    this.active = false;
    this.holdMs = 0;
    this.holdNeed = 900;
    this.holding = false;
    this.closeVisible = false;

    this.corner = document.createElement("div");
    this.corner.id = "fs-corner";
    this.corner.setAttribute("aria-hidden", "true");
    this.corner.innerHTML = `<button type="button" id="fs-close" class="fs-close" hidden title="Vollbild beenden">✕</button>`;
    document.body.appendChild(this.corner);

    this.closeBtn = this.corner.querySelector("#fs-close");
    this.closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.exit();
    });

    const startHold = (e) => {
      if (!this.active) return;
      const r = this.corner.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      if (t.clientX <= r.right && t.clientY <= r.bottom) {
        this.holding = true;
        this.holdMs = 0;
      }
    };
    const endHold = () => {
      this.holding = false;
      this.holdMs = 0;
      if (!this.closeVisible) this.closeBtn.hidden = true;
    };

    this.corner.addEventListener("pointerdown", startHold);
    window.addEventListener("pointerup", endHold);
    window.addEventListener("pointercancel", endHold);
    document.addEventListener("fullscreenchange", () => {
      // ESC/System darf nicht beenden — nur X nach Langhalten in der Ecke
      if (!document.fullscreenElement && this.active) {
        this._setCss(true);
      }
    });
  }

  async enter() {
    this.active = true;
    this._setCss(true);
    this._hideClose();
    const el = this.app || this.root;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (_) {
      /* iOS/PWA: CSS-Fullscreen reicht */
    }
  }

  async exit() {
    this.active = false;
    this._setCss(false);
    this._hideClose();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
    } catch (_) {
      /* ignore */
    }
  }

  _setCss(on) {
    document.body.classList.toggle("play-fullscreen", on);
  }

  _hideClose() {
    this.closeVisible = false;
    this.closeBtn.hidden = true;
    this.corner.classList.remove("armed");
  }

  /** pro Frame aufrufen (dt in ms) */
  tick(dt) {
    if (!this.active) return;
    if (this.holding && !this.closeVisible) {
      this.holdMs += dt;
      this.corner.classList.add("holding");
      if (this.holdMs >= this.holdNeed) {
        this.closeVisible = true;
        this.closeBtn.hidden = false;
        this.corner.classList.add("armed");
        this.holding = false;
      }
    } else {
      this.corner.classList.remove("holding");
    }
  }
}
