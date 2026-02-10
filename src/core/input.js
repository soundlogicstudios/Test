// src/core/input.js
export function createInput({ rootEl, router }) {
  // Dev buttons on menu (data-go)
  rootEl.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-go]");
    if (!btn) return;
    const screen = btn.getAttribute("data-go");
    if (screen) router.go(screen);
  });

  // Optional: keyboard shortcuts for desktop testing
  window.addEventListener("keydown", (e) => {
    if (e.key === "1") router.go("menu");
    if (e.key === "2") router.go("story_oregon_trail");
    if (e.key === "3") router.go("hunt_oregon_trail");
  });
}
