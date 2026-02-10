// src/core/screen_manager.js

const loadedCss = new Set();

function ensure_css_loaded(href) {
  if (!href || loadedCss.has(href)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  loadedCss.add(href);
}

function clear_hitboxes(screenEl) {
  const layer = screenEl.querySelector(".hitbox-layer");
  if (layer) layer.innerHTML = "";
}

function ensure_story_back_library_el(screenEl) {
  // We create the element once so your story CSS can position it.
  let el = screenEl.querySelector(".vc-back-library");
  if (el) return;

  el = document.createElement("div");
  el.className = "vc-back-library";
  el.setAttribute("aria-hidden", "true");
  screenEl.appendChild(el);
}

function dispatch_screenchange(activeId) {
  try {
    window.dispatchEvent(new CustomEvent("vc:screenchange", { detail: { screen: activeId } }));
  } catch (_) {
    // no-op
  }
}

export function createScreenManager({ registry, rootEl }) {
  const screens = new Map();
  const screenEls = Array.from(rootEl.querySelectorAll(".screen"));
  for (const el of screenEls) {
    const id = el.getAttribute("data-screen");
    if (id) screens.set(id, el);
  }

  let active = null;

  async function show(screenId) {
    const id = String(screenId || "").trim();
    if (!id) return;

    const screenDef = registry?.screens?.[id];
    const screenEl = screens.get(id);

    if (!screenDef || !screenEl) {
      console.warn("[SCREEN] Missing screen in registry or HTML:", id);
      return;
    }

    // Hide old
    if (active && screens.get(active)) {
      const oldEl = screens.get(active);
      oldEl.classList.remove("is-active");
      clear_hitboxes(oldEl);
    }

    // Ensure screen CSS
    ensure_css_loaded(screenDef.css);

    // Screen-specific DOM helpers
    if (id === "story_oregon_trail") {
      ensure_story_back_library_el(screenEl);
    }

    // Show new
    screenEl.classList.add("is-active");
    active = id;

    dispatch_screenchange(active);
  }

  function get_active() {
    return active;
  }

  return { show, get_active };
}
