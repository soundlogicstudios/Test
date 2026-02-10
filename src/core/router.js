// src/core/router.js
export function createRouter({ screenManager, registry }) {
  function go(screenId) {
    const id = String(screenId || "").trim();
    if (!id) return;
    screenManager.show(id);
  }

  return { go };
}
