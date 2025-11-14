// TourManager.js - Manages guided tours
export class TourManager {
  constructor() {
    this.SHEPHERD_JS_SRC = "https://cdn.jsdelivr.net/npm/shepherd.js@8.5.1/dist/js/shepherd.min.js";
    this.SHEPHERD_CSS_SRC = "https://cdn.jsdelivr.net/npm/shepherd.js@8.5.1/dist/css/shepherd.css";
    this.shepherdLoaderPromise = null;
    this.currentTour = null; // Keep reference to active tour for cleanup
  }

  init() {
    if (document.body.dataset.page !== "dashboard") return;

    this.ensureShepherdAssets()
      .then(() => {
        if (typeof window.Shepherd === "undefined") return;
        // Attach tour initialization to event listener so we can keep a reference
        const tourTrigger = document.querySelector("[data-tour-trigger]");
        if (tourTrigger) {
          tourTrigger.addEventListener("click", this.startTour.bind(this));
        }
      })
      .catch((error) => {
        console.warn("Shepherd assets unavailable", error);
      });
  }

  startTour() {
    if (this.currentTour && this.currentTour.isActive()) {
      // If a tour is already active, cancel it
      this.currentTour.cancel();
    }

    this.currentTour = new window.Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shepherd-theme-arrows",
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });

    this.currentTour.addStep({
      id: "threat-index",
      text: "The Global Threat Index provides an at-a-glance score of narrative risk versus industry benchmarks.",
      attachTo: {
        element: document.querySelector(".card[data-tour='threat-index']") || ".card",
        on: "bottom",
      },
      buttons: [
        {
          text: "Next",
          action: this.currentTour.next,
        },
      ],
    });

    this.currentTour.addStep({
      id: "heatmap",
      text: "Use the narrative heatmap and 3D globe to monitor regional activity in real time.",
      attachTo: {
        element: ".card[data-tour='heatmap']",
        on: "top",
      },
      buttons: [
        {
          text: "Back",
          action: this.currentTour.back,
        },
        {
          text: "Next",
          action: this.currentTour.next,
        },
      ],
    });

    this.currentTour.addStep({
      id: "activity",
      text: "Review the activity feed for explainable events, sandbox outcomes, and HITL escalations.",
      attachTo: {
        element: ".card[data-tour='activity']",
        on: "left",
      },
      buttons: [
        {
          text: "Back",
          action: this.currentTour.back,
        },
        {
          text: "Finish",
          action: this.currentTour.complete,
        },
      ],
    });

    this.currentTour.start();
  }

  destroy() {
    // Clean up active tour if exists
    if (this.currentTour) {
      if (this.currentTour.isActive()) {
        this.currentTour.cancel();
      }
      this.currentTour = null;
    }
    
    // Cancel any pending shepherd loader promises
    if (this.shepherdLoaderPromise) {
      // Note: Native Promises don't have cancellation, so we just clear the reference
      this.shepherdLoaderPromise = null;
    }
    
    console.log('TourManager resources cleaned up');
  }

  ensureShepherdAssets() {
    if (typeof window.Shepherd !== "undefined") {
      return Promise.resolve();
    }
    if (this.shepherdLoaderPromise) {
      return this.shepherdLoaderPromise;
    }
    this.shepherdLoaderPromise = Promise.all([this.loadStylesheetOnce(this.SHEPHERD_CSS_SRC), this.loadScriptOnce(this.SHEPHERD_JS_SRC)]).catch((error) => {
      this.shepherdLoaderPromise = null;
      throw error;
    });
    return this.shepherdLoaderPromise;
  }

  loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  loadStylesheetOnce(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load ${href}`));
      document.head.appendChild(link);
    });
  }
}