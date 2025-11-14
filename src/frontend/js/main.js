import { ThemeManager } from './utils/themeManager.js';
import { LayoutManager } from './utils/layoutManager.js';
import { AnimationManager } from './utils/animationManager.js';
import { TooltipManager } from './utils/tooltipManager.js';
import { TourManager } from './utils/tourManager.js';
import { ChartRenderer } from './components/chartRenderer.js';
import { NarrativeGlobe } from './components/narrativeGlobe.js';
import { mockApiService } from './services/mockApiService.js';

window.MockApiClient = mockApiService;

class GenaroApp {
  constructor() {
    this.themeManager = new ThemeManager();
    this.layoutManager = new LayoutManager();
    this.animationManager = new AnimationManager();
    this.tooltipManager = new TooltipManager();
    this.tourManager = new TourManager();
    this.chartRenderer = new ChartRenderer();
    this.narrativeGlobe = new NarrativeGlobe();

    this.init();
  }

  async init() {
    try {
      // Initialize theme management
      await this.wrapWithErrorBoundary('themeManager.init', () => this.themeManager.init());

      // Initialize layout management
      await this.wrapWithErrorBoundary('layoutManager.init', () => this.layoutManager.init());

      // Initialize animations
      await this.wrapWithErrorBoundary('animationManager.init', () => this.animationManager.init());

      // Initialize tooltips
      await this.wrapWithErrorBoundary('tooltipManager.init', () => this.tooltipManager.init());

      // Initialize guided tours
      await this.wrapWithErrorBoundary('tourManager.init', () => this.tourManager.init());

      // Initialize narrative globe visualization
      await this.wrapWithErrorBoundary('narrativeGlobe.init', () => this.narrativeGlobe.init());

      // Initialize chart rendering system
      await this.wrapWithErrorBoundary('chartRenderer.init', () => this.chartRenderer.init());

      // Initialize timestamp updates
      await this.wrapWithErrorBoundary('initTimestamps', () => this.initTimestamps());

      // Initialize navigation highlighting
      await this.wrapWithErrorBoundary('initNavigation', () => this.initNavigation());

      // Initialize segmented controls
      await this.wrapWithErrorBoundary('initSegmentedControls', () => this.initSegmentedControls());
      await this.wrapWithErrorBoundary('initAccessibleTooltips', () => this.initAccessibleTooltips());
      await this.wrapWithErrorBoundary('initNavToggle', () => this.initNavToggle());

      console.log('Genaro DFT 2.0 application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Genaro DFT 2.0 application:', error);
      // Show error to user
      this.showErrorNotification('Application failed to initialize. Please refresh the page or contact support.');
    }
  }

  // Generic error boundary wrapper for component initialization
  async wrapWithErrorBoundary(operationName, operation) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Error during ${operationName}:`, error);
      this.showErrorNotification(`An error occurred during ${operationName.replace('.init', '').replace('.', ' ')}. Some features may not work correctly.`);
    }
  }

  // Clean up resources when the application is destroyed
  destroy() {
    try {
      // Clean up narrative globe
      if (this.narrativeGlobe) {
        this.wrapWithErrorBoundary('narrativeGlobe.cleanupGlobe', () => 
          this.narrativeGlobe.cleanupGlobe(document.getElementById("dashboard-globe")));
      }
      
      // Clean up animations
      if (this.animationManager) {
        this.wrapWithErrorBoundary('animationManager.destroy', () => this.animationManager.destroy());
      }
      
      // Clean up tooltips
      if (this.tooltipManager) {
        this.wrapWithErrorBoundary('tooltipManager.cleanupTooltips', () => this.tooltipManager.cleanupTooltips());
      }
      
      // Clean up tours
      if (this.tourManager) {
        this.wrapWithErrorBoundary('tourManager.destroy', () => this.tourManager.destroy());
      }
      
      // Clean up chart renderer
      if (this.chartRenderer) {
        this.wrapWithErrorBoundary('chartRenderer.destroy', () => this.chartRenderer.destroy());
      }
      
      // Clear any timers or intervals if present
      // (Currently no timers/intervals in this class, but kept as stub for future use)
      
      console.log('Genaro DFT 2.0 application destroyed successfully');
    } catch (error) {
      console.error('Error during application destruction:', error);
    }
  }

  // Show error notification to the user
  showErrorNotification(message) {
    // Create or update notification element
    let notificationEl = document.getElementById('app-error-notification');
    
    if (!notificationEl) {
      notificationEl = document.createElement('div');
      notificationEl.id = 'app-error-notification';
      notificationEl.className = 'notification notification--error';
      notificationEl.setAttribute('role', 'alert');
      notificationEl.setAttribute('aria-live', 'assertive');
      
      // Position the notification in the header area
      const header = document.querySelector('.top-bar') || document.body.firstChild;
      if (header) {
        header.parentNode.insertBefore(notificationEl, header.nextSibling);
      } else {
        document.body.appendChild(notificationEl);
      }
    }
    
    // Set the notification content
    notificationEl.innerHTML = `
      <div class="notification__content notification__content--error">
        <div class="notification__icon">⚠️</div>
        <div class="notification__message">${message}</div>
        <button class="notification__close" aria-label="Close notification" type="button">&times;</button>
      </div>
    `;
    
    // Add click handler to close the notification
    const closeBtn = notificationEl.querySelector('.notification__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notificationEl.remove();
      });
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notificationEl && document.body.contains(notificationEl)) {
        notificationEl.remove();
      }
    }, 10000);
  }

  initTimestamps() {
    const timestampNodes = document.querySelectorAll("[data-current-timestamp]");
    if (timestampNodes.length) {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: false,
      }).format(now);

      timestampNodes.forEach((node) => {
        node.textContent = formatted;
      });
    }
  }

  initNavigation() {
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
  }

  initSegmentedControls() {
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
  }

  initAccessibleTooltips() {
    document.querySelectorAll("[data-tippy-content]").forEach((node) => {
      // Provide focus-based fallback text
      if (!node.getAttribute('aria-describedby')) {
        const helperId = `${node.id || 'tooltip'}-helper-${Math.random().toString(36).slice(2, 7)}`;
        const helper = document.createElement('span');
        helper.id = helperId;
        helper.className = 'sr-only';
        helper.textContent = node.getAttribute('data-tippy-content') || '';
        node.setAttribute('aria-describedby', helperId);
        node.appendChild(helper);
      }

      node.addEventListener('focus', () => {
        if (node._tippy) {
          node._tippy.show();
        }
      });

      node.addEventListener('blur', () => {
        if (node._tippy) {
          node._tippy.hide();
        }
      });
    });
  }

  initNavToggle() {
    const toggle = document.querySelector('[data-nav-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.genaroApp = new GenaroApp();
});

// Handle page visibility changes for proper cleanup
window.addEventListener('beforeunload', () => {
  if (window.genaroApp && typeof window.genaroApp.destroy === 'function') {
    window.genaroApp.destroy();
  }
});

// Also handle window closing or tab closing
window.addEventListener('pagehide', () => {
  if (window.genaroApp && typeof window.genaroApp.destroy === 'function') {
    window.genaroApp.destroy();
  }
});

// Export for potential use in other modules if needed
export { GenaroApp };
