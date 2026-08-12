/**
 * Spiel-Vollbild: sichtbares Icon zum Starten.
 * Beenden: oben links lange halten → ✕.
 */
export class FullscreenUI {
  constructor() {
    this.root = document.documentElement;
    this.app = document.querySelector(".app");
    this.stage = document.querySelector(".stage-wrap");
    this.active = false;
    this.holdMs = 0;
    this.holdNeed = 900;
    this.holding = false;
    this.closeVisible = false;

    this.enterBtn = document.createElement("button");
    this.enterBtn.type = "button";
    this.enterBtn.id = "fs-enter";
    this.enterBtn.className = "fs-enter";
    this.enterBtn.title = "Vollbild";
    this.enterBtn.setAttribute("aria-label", "Vollbild starten");
    this.enterBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zM3 14h2v5h5v2H3v-7zm16 0h2v7h-7v-2h5v-5z"/>
      </svg>
      <span>FULL</span>
    `;
    (this.stage || document.body).appendChild(this.enterBtn);
    this.enterBtn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.enter();
    });

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
      if (!document.fullscreenElement && this.active) {
        this._setCss(true);
      }
      this._syncEnterBtn();
    });
    this._syncEnterBtn();
  }

  async enter() {
    this.active = true;
    this._setCss(true);
    this._hideClose();
    this._syncEnterBtn();
    const targets = [this.stage, this.app, this.root].filter(Boolean);
    for (const el of targets) {
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: "hide" });
          break;
        }
        if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
          break;
        }
      } catch (_) {
        /* nächstes Target / CSS-Fallback */
      }
    }
  }

  async exit() {
    this.active = false;
    this._setCss(false);
    this._hideClose();
    this._syncEnterBtn();
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

  _syncEnterBtn() {
    if (!this.enterBtn) return;
    this.enterBtn.hidden = !!this.active;
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
