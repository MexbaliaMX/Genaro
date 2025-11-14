// AnimationManager.js - Manages UI animations
export class AnimationManager {
  constructor() {
    this.reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    this.cardsObserver = null; // Keep reference to IntersectionObserver for cleanup
  }

  init() {
    this.animateKpis();
    this.animateCardsOnScroll();
  }

  // Clean up animation resources
  destroy() {
    // Disconnect the IntersectionObserver if it exists
    if (this.cardsObserver) {
      this.cardsObserver.disconnect();
      this.cardsObserver = null;
    }
    
    // Cancel any ongoing animations if necessary
    // (Though anime.js handles its own cleanup)
    
    console.log('AnimationManager resources cleaned up');
  }

  animateKpis() {
    // Only run if anime.js is available
    if (typeof window.anime === "undefined") return;

    const shouldReduceMotion = this.reduceMotion?.matches;
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
      window.anime({
        targets: counter,
        value: numeric,
        easing: "easeOutExpo",
        duration: 1200,
        update: () => render(counter.value),
      });
    });
  }

  animateCardsOnScroll() {
    // Only run if anime.js is available
    if (typeof window.anime === "undefined") return;

    const shouldReduceMotion = this.reduceMotion?.matches;
    if (shouldReduceMotion) {
      document.querySelectorAll(".card").forEach((card) => {
        card.style.opacity = "";
        card.style.transform = "";
      });
      return;
    }

    // Use IntersectionObserver if available, otherwise animate all cards immediately
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".card").forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
        card.dataset.animated = "true";
      });
      return;
    }

    // Disconnect existing observer if it exists
    if (this.cardsObserver) {
      this.cardsObserver.disconnect();
    }
    
    this.cardsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = "true";
            window.anime({
              targets: entry.target,
              translateY: [40, 0],
              opacity: [0, 1],
              easing: "easeOutQuad",
              duration: 800,
              delay: window.anime.stagger(85),
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".card").forEach((card) => {
      card.style.opacity = "0";
      this.cardsObserver.observe(card);
    });
  }
}