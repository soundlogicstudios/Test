// src/core/bootstrap.js
import { createRouter } from "./router.js";
import { createScreenManager } from "./screen_manager.js";
import { createInput } from "./input.js";

window.__BOOT_VER = "v_boot_reset_002";

function is_debug_enabled() {
  try {
    const params = new URLSearchParams(location.search);
    return params.get("debug") === "1";
  } catch (_) {
    return false;
  }
}

async function load_registry() {
  const res = await fetch("screen_registry.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load screen_registry.json (${res.status})`);
  return await res.json();
}

function inject_debug_css() {
  const href = "styles/debug_toolkit.css";
  const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(
    (l) => (l.getAttribute("href") || "") === href
  );
  if (exists) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function init_debug_toolkit() {
  // Your overlay path may differ. Keep it resilient.
  // If it fails, we do NOT crash boot.
  try {
    inject_debug_css();
    const mod = await import("./overlays/debug_toolkit.js");
    if (typeof mod.init_debug_toolkit === "function") {
      mod.init_debug_toolkit();
    }
  } catch (err) {
    console.warn("[BOOT] Debug toolkit not loaded:", err);
  }
}

async function init_controllers() {
  // Controllers must never crash boot. If they fail, log + continue.
  try {
    const mod = await import("./controllers/hunt_oregon_trail_controller.js");
    const fn = mod?.init_hunt_oregon_trail_controller;
    if (typeof fn === "function") fn();
    else console.warn("[BOOT] hunt controller export missing: init_hunt_oregon_trail_controller");
  } catch (err) {
    console.warn("[BOOT] hunt controller not loaded:", err);
  }
}

async function main() {
  const debug = is_debug_enabled();
  if (debug) document.body.classList.add("debug");

  const registry = await load_registry();

  const rootEl = document.getElementById("appRoot");
  if (!rootEl) throw new Error("Missing #appRoot");

  const screenManager = createScreenManager({ registry, rootEl });
  const router = createRouter({ screenManager, registry });
  createInput({ rootEl, router });

  await init_controllers();

  if (debug) await init_debug_toolkit();

  // Initial screen
  router.go(registry.start_screen || "menu");
}

main().catch((err) => {
  console.error("[BOOT] Fatal error:", err);
  alert("Boot error. Open console to see details.");
});
