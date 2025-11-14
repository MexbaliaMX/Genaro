// TooltipManager.js - Manages tooltip functionality
export class TooltipManager {
  constructor() {
    this.tippyInstances = [];
    this.ALLOWED_TOOLTIP_TAGS = new Set(["STRONG", "BR"]);
    this.ALLOWED_ATTRIBUTES = new Set(["class", "title", "role"]);
  }

  init() {
    this.initStaticTooltips();
    window.tippyInstances = this.tippyInstances;
  }

  initStaticTooltips() {
    if (typeof window.tippy === "undefined") {
      return;
    }

    document.querySelectorAll("[data-tippy-content]").forEach((node) => {
      if (node.dataset.tippyBound === "true") return;

      const sanitizedContent = this.sanitizeTooltipHtml(node.getAttribute("data-tippy-content"));
      const instance = window.tippy(node, {
        content: sanitizedContent,
        allowHTML: true,
        theme: "custom",
        placement: "top",
        animation: "shift-away",
        appendTo: document.body,
      });

      this.tippyInstances.push(instance);
      node.dataset.tippyBound = "true";
    });
  }

  sanitizeTooltipHtml(html) {
    // Implementation to sanitize HTML content for tooltips
    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const sanitized = this.sanitizeElement(doc.body);
      return sanitized.innerHTML;
    } else {
      // Fallback: basic sanitization
      const div = document.createElement('div');
      div.textContent = html;
      return div.textContent;
    }
  }

  sanitizeElement(element) {
    // Remove disallowed attributes from the current element first
    if (element?.attributes) {
      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = (attr.value || '').trim();
        const isAriaAttribute = name.startsWith('aria-');
        const isAllowed =
          this.ALLOWED_ATTRIBUTES.has(name) || isAriaAttribute;

        const hasEventHandler = name.startsWith('on');
        const hasJavascriptUrl = value.toLowerCase().startsWith('javascript:');

        if (!isAllowed || hasEventHandler || hasJavascriptUrl) {
          element.removeAttribute(attr.name);
        }
      });
    }

    for (let i = element.children.length - 1; i >= 0; i--) {
      const child = element.children[i];
      if (!this.ALLOWED_TOOLTIP_TAGS.has(child.tagName)) {
        child.remove();
      } else {
        this.sanitizeElement(child);
      }
    }
    return element;
  }

  cleanupTooltips() {
    if (typeof window.tippy !== "undefined" && this.tippyInstances) {
      this.tippyInstances.forEach(instance => {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      });
      this.tippyInstances = [];
    }
  }
}
