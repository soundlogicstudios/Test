// src/core/bootstrap.js
import { createRouter } from "./router.js";
import { createScreenManager } from "./screen_manager.js";
import { createInput } from "./input.js";

window.__BOOT_VER = "v_boot_clean_001";

async function load_registry() {
  const res = await fetch("screen_registry.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load screen_registry.json (${res.status})`);
  return await res.json();
}

async function main() {
  const registry = await load_registry();

  const rootEl = document.getElementById("appRoot");
  if (!rootEl) throw new Error("Missing #appRoot");

  const screenManager = createScreenManager({ registry, rootEl });
  const router = createRouter({ screenManager, registry });
  createInput({ rootEl, router });

  // Start on registry start screen
  router.go(registry.start_screen || "menu");
}

main().catch((err) => {
  console.error("[BOOT] Fatal error:", err);
  alert("Boot error. Open console to see details.");
});
