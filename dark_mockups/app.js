const SHEPHERD_JS_SRC = "https://cdn.jsdelivr.net/npm/shepherd.js@8.5.1/dist/js/shepherd.min.js";
const SHEPHERD_CSS_SRC = "https://cdn.jsdelivr.net/npm/shepherd.js@8.5.1/dist/css/shepherd.css";
const THEME_STORAGE_KEY = "genaroTheme";
const LAYOUT_STORAGE_KEY = "genaroLayout";
let shepherdLoaderPromise = null;

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initLayoutToggle();
  if (typeof dayjs !== "undefined") {
    dayjs.extend(dayjs_plugin_utc);
    dayjs.extend(dayjs_plugin_timezone);
  }

  const timestampNodes = document.querySelectorAll("[data-current-timestamp]");
  if (timestampNodes.length) {
    const now = new Date();
    const formatted =
      typeof dayjs !== "undefined"
        ? dayjs(now).tz("UTC").format("YYYY-MM-DD HH:mm:ss [UTC]")
        : now.toLocaleString("en-US", {
            timeZoneName: "short",
            hour12: false,
          });
    timestampNodes.forEach((node) => {
      node.textContent = formatted;
    });
  }

  const pageId = document.body.dataset.page;
  if (pageId) {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const isActive = link.dataset.nav === pageId;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  document.querySelectorAll(".segmented-control").forEach((group) => {
    const buttons = group.querySelectorAll(".segmented-control__option");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((other) => {
          other.classList.remove("is-active");
          other.setAttribute("aria-pressed", "false");
        });
        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");
      });
    });
  });

  animateKpis();
  animateCardsOnScroll();
  initShepherdTour();
});

function initThemeToggle() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = storedTheme || "dark";
  applyTheme(initialTheme);

  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = (document.body.dataset.theme || "dark") === "light" ? "dark" : "light";
      applyTheme(nextTheme);
    });
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  const isLight = theme === "light";
  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-pressed", String(isLight));
    const icon = toggle.querySelector("[data-theme-toggle-icon]");
    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    const label = toggle.querySelector("[data-theme-toggle-label]");
    if (label) label.textContent = isLight ? "Switch to Dark Theme" : "Switch to Light Theme";
  });
}

function animateKpis() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (typeof anime === "undefined") return;
  const shouldReduceMotion = reduceMotion?.matches;
  const elements = document.querySelectorAll(".metric-value");
  elements.forEach((el) => {
    const original = el.textContent.trim();
    const match = original.match(/[-+]?[0-9.,]+/);
    if (!match) return;

    const valueStart = typeof match.index === "number" ? match.index : original.indexOf(match[0]);
    const prefix = original.slice(0, valueStart);
    const suffix = original.slice(valueStart + match[0].length);
    const numericRaw = match[0].replace(/,/g, "");
    const numeric = parseFloat(numericRaw);
    if (Number.isNaN(numeric)) return;

    const decimals = (numericRaw.split(".")[1] || "").length;
    const showPlus = match[0].trim().startsWith("+");
    const formatter = new Intl.NumberFormat(navigator.language || "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const render = (value) => {
      let displayValue;
      if (decimals === 0) {
        displayValue = Math.round(value);
      } else {
        displayValue = Number(value.toFixed(decimals));
      }
      if (Object.is(displayValue, -0)) {
        displayValue = 0;
      }
      const formatted = formatter.format(displayValue);
      const signPrefix = showPlus && displayValue >= 0 ? "+" : "";
      el.textContent = `${prefix}${signPrefix}${formatted}${suffix}`;
    };

    if (shouldReduceMotion) {
      render(numeric);
      return;
    }

    render(0);

    const counter = { value: 0 };
    anime({
      targets: counter,
      value: numeric,
      easing: "easeOutExpo",
      duration: 1200,
      update: () => render(counter.value),
    });
  });
}

function animateCardsOnScroll() {
  if (typeof anime === "undefined") return;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (reduceMotion?.matches || typeof IntersectionObserver === "undefined") {
    document.querySelectorAll(".card").forEach((card) => {
      card.style.opacity = "";
      card.style.transform = "";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          anime({
            targets: entry.target,
            translateY: [40, 0],
            opacity: [0, 1],
            easing: "easeOutQuad",
            duration: 800,
            delay: anime.stagger(85),
          });
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".card").forEach((card) => {
    card.style.opacity = "0";
    observer.observe(card);
  });
}

function initLayoutToggle() {
  const storedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
  const initialLayout = storedLayout || "standard";
  applyLayout(initialLayout);

  document.querySelectorAll("[data-layout-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextLayout = (document.body.dataset.layout || "standard") === "wide" ? "standard" : "wide";
      applyLayout(nextLayout);
    });
  });
}

function applyLayout(layout) {
  document.body.dataset.layout = layout;
  localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
  const isWide = layout === "wide";
  document.querySelectorAll("[data-layout-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-pressed", String(isWide));
    const label = toggle.querySelector("[data-layout-toggle-label]");
    if (label) label.textContent = isWide ? "Collapse layout" : "Expand layout";
  });
}

function initShepherdTour() {
  if (document.body.dataset.page !== "dashboard") return;

  ensureShepherdAssets()
    .then(() => {
      if (typeof Shepherd === "undefined") return;
      startTour();
    })
    .catch((error) => {
      console.warn("Shepherd assets unavailable", error);
    });

  function startTour() {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shepherd-theme-arrows",
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });

    tour.addStep({
      id: "threat-index",
      text: "The Global Threat Index provides an at-a-glance score of narrative risk versus industry benchmarks.",
      attachTo: {
        element: document.querySelector(".card[data-tour='threat-index']") || ".card",
        on: "bottom",
      },
      buttons: [
        {
          text: "Next",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "heatmap",
      text: "Use the narrative heatmap and 3D globe to monitor regional activity in real time.",
      attachTo: {
        element: ".card[data-tour='heatmap']",
        on: "top",
      },
      buttons: [
        {
          text: "Back",
          action: tour.back,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "activity",
      text: "Review the activity feed for explainable events, sandbox outcomes, and HITL escalations.",
      attachTo: {
        element: ".card[data-tour='activity']",
        on: "left",
      },
      buttons: [
        {
          text: "Back",
          action: tour.back,
        },
        {
          text: "Finish",
          action: tour.complete,
        },
      ],
    });

    const tourTrigger = document.querySelector("[data-tour-trigger]");
    if (tourTrigger) {
      tourTrigger.addEventListener("click", () => tour.start());
    }
  }
}

function ensureShepherdAssets() {
  if (typeof Shepherd !== "undefined") {
    return Promise.resolve();
  }
  if (shepherdLoaderPromise) {
    return shepherdLoaderPromise;
  }
  shepherdLoaderPromise = Promise.all([loadStylesheetOnce(SHEPHERD_CSS_SRC), loadScriptOnce(SHEPHERD_JS_SRC)]).catch((error) => {
    shepherdLoaderPromise = null;
    throw error;
  });
  return shepherdLoaderPromise;
}

const loadedScripts = new Map();
function loadScriptOnce(src) {
  if (loadedScripts.has(src)) {
    return loadedScripts.get(src);
  }
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
  loadedScripts.set(src, promise);
  return promise;
}

const loadedStyles = new Map();
function loadStylesheetOnce(href) {
  if (loadedStyles.has(href)) {
    return loadedStyles.get(href);
  }
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });
  loadedStyles.set(href, promise);
  return promise;
}
