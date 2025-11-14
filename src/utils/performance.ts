/**
 * Performance optimization utilities for Genaro DFT 2.0 platform
 * Contains various performance enhancement techniques
 */

// Debounce function to limit function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls at a steady rate
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization function to cache function results
export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map<string, any>();
  return function (...args: Parameters<T>): any {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
};

// Lazy load images
export const lazyLoadImage = (img: HTMLImageElement) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const imgElement = entry.target as HTMLImageElement;
        imgElement.src = imgElement.dataset.src || '';
        imgElement.classList.remove('lazy');
        observer.unobserve(imgElement);
      }
    });
  });

  imageObserver.observe(img);
};

// Virtual scrolling implementation for large lists
export interface VirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight: number;
}

export const createVirtualScroller = (
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  return (startIndex: number, endIndex: number, totalItems: number) => {
    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(totalItems - 1, endIndex + overscan);

    return {
      overscanStart,
      overscanEnd,
      translateY: overscanStart * itemHeight,
    };
  };
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, { start: string; end: string; duration: number }> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, start: string, end: string): void {
    const startMark = this.marks.get(start);
    const endMark = this.marks.get(end);
    
    if (startMark !== undefined && endMark !== undefined) {
      const duration = endMark - startMark;
      this.measures.set(name, { start, end, duration });
      console.info(`${name}: ${duration.toFixed(2)}ms`);
    }
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name)?.duration;
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }

  // Web Vitals reporting
  reportWebVitals(onPerfEntry?: (metric: any) => void) {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      });
    }
  }
}

// Resource preloading
export const preloadResource = (url: string, as: 'image' | 'script' | 'style' | 'font' | 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

// Efficient data structure for large datasets
export class EfficientDataSet<T> {
  private data: T[] = [];
  private indexMap: Map<string, number> = new Map(); // For fast lookups by ID
  private batchOperations: Array<() => void> = [];

  constructor(initialData?: T[]) {
    if (initialData) {
      this.data = [...initialData];
      // Assuming T has an 'id' property that's a string
      this.data.forEach((item, index) => {
        (item as any).id && this.indexMap.set((item as any).id, index);
      });
    }
  }

  get(id: string): T | undefined {
    const index = this.indexMap.get(id);
    return index !== undefined ? this.data[index] : undefined;
  }

  add(item: T): void {
    const id = (item as any).id;
    if (id) {
      this.indexMap.set(id, this.data.length);
    }
    this.data.push(item);
  }

  remove(id: string): boolean {
    const index = this.indexMap.get(id);
    if (index === undefined) return false;
    
    this.data.splice(index, 1);
    this.indexMap.delete(id);
    
    // Update indices after removal
    for (const [key, idx] of this.indexMap.entries()) {
      if (idx > index) {
        this.indexMap.set(key, idx - 1);
      }
    }
    
    return true;
  }

  update(id: string, updates: Partial<T>): boolean {
    const index = this.indexMap.get(id);
    if (index === undefined) return false;
    
    this.data[index] = { ...this.data[index], ...updates };
    return true;
  }

  // Batch operations for performance
  batch(operation: () => void): void {
    this.batchOperations.push(operation);
  }

  commitBatch(): void {
    this.batchOperations.forEach(op => op());
    this.batchOperations = [];
  }

  getAll(): T[] {
    return [...this.data];
  }

  size(): number {
    return this.data.length;
  }
}

// Efficient rendering for large lists
export class ListRenderer<T> {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleItems: number;
  private data: T[] = [];
  private renderItem: (item: T, index: number) => HTMLElement;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    renderItem: (item: T, index: number) => HTMLElement
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 5; // 5 extra for smoothness
    this.renderItem = renderItem;
  }

  setData(data: T[]): void {
    this.data = data;
    this.render();
  }

  private render(): void {
    // Clear container
    this.container.innerHTML = '';
    
    // Only render visible items
    for (let i = 0; i < Math.min(this.visibleItems, this.data.length); i++) {
      const itemElement = this.renderItem(this.data[i], i);
      this.container.appendChild(itemElement);
    }
  }

  updateVisibleRange(start: number, end: number): void {
    // Implement scroll-based rendering here
    // This would be connected to a scroll event listener
  }
}

// Memory management utilities
export class ResourceManager {
  private resources: Map<string, any> = new Map();
  private activeTimers: Set<NodeJS.Timeout> = new Set();

  registerResource<T>(id: string, resource: T): void {
    this.resources.set(id, resource);
  }

  unregisterResource(id: string): void {
    const resource = this.resources.get(id);
    if (resource && typeof resource === 'object') {
      if (resource.destroy && typeof resource.destroy === 'function') {
        resource.destroy();
      } else if (resource.abort && typeof resource.abort === 'function') {
        resource.abort();
      }
    }
    this.resources.delete(id);
  }

  clear(): void {
    // Clear all resources
    for (const [id, resource] of this.resources) {
      this.unregisterResource(id);
    }

    // Clear all active timers
    for (const timer of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }

  // Create a timeout that's tracked for cleanup
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.activeTimers.delete(timer);
    }, delay) as unknown as NodeJS.Timeout;
    
    this.activeTimers.add(timer);
    return timer;
  }
}

// Feature detection for browser compatibility
export const featureDetection = {
  webGL: (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  },
  
  webSockets: (): boolean => {
    return 'WebSocket' in window;
  },
  
  serviceWorkers: (): boolean => {
    return 'serviceWorker' in navigator;
  },
  
  intersectionObserver: (): boolean => {
    return 'IntersectionObserver' in window;
  },
  
  requestIdleCallback: (): boolean => {
    return 'requestIdleCallback' in window;
  },
  
  passiveEvents: (): boolean => {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
          return true;
        }
      });
      // @ts-ignore
      window.addEventListener('testPassive', null, opts);
      // @ts-ignore
      window.removeEventListener('testPassive', null, opts);
    } catch (e) {
      // No support
    }
    return supportsPassive;
  }
};

// Performance optimization for animations
export const smoothAnimation = (callback: (progress: number) => void, duration: number = 300) => {
  const startTime = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-in-out function
    const easeProgress = progress < 0.5 
      ? 2 * progress * progress 
      : -1 + (4 - 2 * progress) * progress;
    
    callback(easeProgress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};