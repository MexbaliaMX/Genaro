// LayoutManager.js - Manages application layout (wide/standard)
export class LayoutManager {
  constructor() {
    this.LAYOUT_STORAGE_KEY = "genaroLayout";
  }

  init() {
    const storedLayout = this.safeStorageGet(this.LAYOUT_STORAGE_KEY);
    const initialLayout = storedLayout || "standard";
    this.applyLayout(initialLayout);

    document.querySelectorAll("[data-layout-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const nextLayout = (document.body.dataset.layout || "standard") === "wide" ? "standard" : "wide";
        this.applyLayout(nextLayout);
      });
    });
  }

  applyLayout(layout) {
    document.body.dataset.layout = layout;
    this.safeStorageSet(this.LAYOUT_STORAGE_KEY, layout);
    const isWide = layout === "wide";
    
    document.querySelectorAll("[data-layout-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isWide));
      const label = toggle.querySelector("[data-layout-toggle-label]");
      if (label) label.textContent = isWide ? "Collapse layout" : "Expand layout";
    });
  }

  safeStorageGet(key) {
    try {
      return window.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  safeStorageSet(key, value) {
    try {
      window.localStorage?.setItem?.(key, value);
    } catch {
      // Ignore storage errors
    }
  }
}