// src/core/controllers/hunt_oregon_trail_controller.js
import { TargetRunner } from "../games/target_runner.js";

let runner = null;
let bound = false;

function getActiveScreen() {
  return document.querySelector('.screen.is-active[data-screen="hunt_oregon_trail"]');
}

function ensureTargetsLayer(screenEl) {
  const existing = screenEl.querySelector(".layer-targets");
  if (existing) return existing;

  const layer = document.createElement("div");
  layer.className = "layer layer-targets";
  layer.dataset.vcCreated = "1";
  layer.style.position = "absolute";
  layer.style.inset = "0";
  layer.style.pointerEvents = "none";
  screenEl.appendChild(layer);
  return layer;
}

function ensureStripe(screenEl) {
  let stripe = screenEl.querySelector(".hunt-stripe");
  if (stripe) return stripe;

  stripe = document.createElement("div");
  stripe.className = "hunt-stripe";
  stripe.dataset.vcCreated = "1";
  screenEl.appendChild(stripe);
  return stripe;
}

function ensureHud(screenEl) {
  let hud = screenEl.querySelector(".hunt-hud");
  if (hud) return hud;

  hud = document.createElement("div");
  hud.className = "hunt-hud";
  hud.dataset.vcCreated = "1";
  hud.innerHTML = `
    <div class="hunt-pill">Ammo: <span id="huntAmmoVal">10</span></div>
    <div class="hunt-pill">Score: <span id="huntScoreVal">0</span></div>
    <button type="button" class="hunt-fire" id="huntFireBtn">FIRE</button>
  `;
  screenEl.appendChild(hud);
  return hud;
}

function start() {
  const screenEl = getActiveScreen();
  if (!screenEl) return;

  const targetsLayer = ensureTargetsLayer(screenEl);
  ensureStripe(screenEl);
  ensureHud(screenEl);

  const ammoEl = screenEl.querySelector("#huntAmmoVal");
  const scoreEl = screenEl.querySelector("#huntScoreVal");
  const fireBtn = screenEl.querySelector("#huntFireBtn");

  let ammo = 10;
  let score = 0;
  if (ammoEl) ammoEl.textContent = String(ammo);
  if (scoreEl) scoreEl.textContent = String(score);

  runner = new TargetRunner({
    rootEl: screenEl,
    targetsLayerEl: targetsLayer,
    config: {
      // FIXED TRACK + FIXED STRIPE SCORING ZONE
      trackYPercent: 56,
      stripeCenterXPercent: 50,
      stripeHalfWidthPercent: 12,

      // PERFECT / GOOD / GRAZE bands inside stripe
      perfectBandPercent: 2.5,
      goodBandPercent: 5.5,
      grazeBandPercent: 9.0,

      // One target at a time; spawn interval
      spawnIntervalMs: 950,

      // Speed (percent width / second)
      speedPercentPerSec: 28
    },
    onResult: (r) => {
      if (!r) return;
      if (r.points) {
        score += r.points;
        if (scoreEl) scoreEl.textContent = String(score);
      }
    },
    onMiss: () => {
      // optional hook
    }
  });

  runner.start();

  if (fireBtn) {
    fireBtn.onclick = () => {
      if (!runner) return;
      if (ammo <= 0) return;

      ammo -= 1;
      if (ammoEl) ammoEl.textContent = String(ammo);

      runner.fire();

      if (ammo <= 0) {
        runner.stop();
        runner = null;
      }
    };
  }
}

function stop() {
  if (!runner) return;
  runner.stop();
  runner = null;
}

export function init_hunt_oregon_trail_controller() {
  if (bound) return;
  bound = true;

  window.addEventListener("vc:screenchange", () => {
    const active = getActiveScreen();
    if (!active) {
      stop();
      return;
    }
    if (!runner) start();
  });

  // If you land directly on hunt screen
  setTimeout(() => {
    if (getActiveScreen() && !runner) start();
  }, 0);
}
