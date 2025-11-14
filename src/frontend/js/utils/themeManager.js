// ThemeManager.js - Manages application theme (dark/light mode)
export class ThemeManager {
  constructor() {
    this.THEME_STORAGE_KEY = "genaroTheme";
  }

  init() {
    const storedTheme = this.safeStorageGet(this.THEME_STORAGE_KEY);
    const initialTheme = storedTheme || "dark";
    this.applyTheme(initialTheme);

    // Set up theme toggle event listeners
    document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const nextTheme = (document.body.dataset.theme || "dark") === "light" ? "dark" : "light";
        this.applyTheme(nextTheme);
      });
    });
  }

  applyTheme(theme) {
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
    this.safeStorageSet(this.THEME_STORAGE_KEY, theme);
    
    const isLight = theme === "light";
    document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isLight));
      const icon = toggle.querySelector("[data-theme-toggle-icon]");
      if (icon) icon.textContent = isLight ? "☀️" : "🌙";
      const label = toggle.querySelector("[data-theme-toggle-label]");
      if (label) label.textContent = isLight ? "Switch to Dark Theme" : "Switch to Light Theme";
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