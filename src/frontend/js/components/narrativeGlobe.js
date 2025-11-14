// narrativeGlobe.js - Three.js globe visualization component
import { TooltipManager } from '../utils/tooltipManager.js';

/**
 * @typedef {Object} GlobeConfig
 * @property {string} [globeColor='#1f293b'] - Color of the globe in hex
 * @property {number} [globeOpacity=0.35] - Opacity of the globe
 * @property {number} [globeRadius=55] - Radius of the globe
 * @property {boolean} [wireframe=true] - Whether to show globe as wireframe
 * @property {number} [particleCount=750] - Number of particles to show
 * @property {number} [particleSize=2.2] - Size of each particle
 * @property {number} [haloOpacity=0.12] - Opacity of the halo around the globe
 * @property {string} [haloColor='#667eea'] - Color of the halo in hex
 */

/**
 * Component for rendering the narrative globe visualization using Three.js
 */
export class NarrativeGlobe {
  /**
   * Creates a new instance of NarrativeGlobe
   * @param {GlobeConfig} [config={}] - Configuration options for the globe
   */
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      globeColor: config.globeColor || '#1f293b',
      globeOpacity: config.globeOpacity || 0.35,
      globeRadius: config.globeRadius || 55,
      wireframe: config.wireframe !== false, // Default to true
      particleCount: config.particleCount || 750,
      originalParticleCount: config.particleCount || 750, // Store original count for LOD calculations
      particleSize: config.particleSize || 2.2,
      haloOpacity: config.haloOpacity || 0.12,
      haloColor: config.haloColor || '#667eea',
    };
    
    // Three.js object references for cleanup
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globe = null;
    this.points = null;
    this.halo = null;
    this.globeGeometry = null;
    this.globeMaterial = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.haloGeometry = null;
    this.haloMaterial = null;
    
    // Animation control
    this.animationFrameId = null;
    this.isPaused = false;
    
    // Event handlers for cleanup
    this.visibilityHandler = null;
    this.resizeHandler = null;
    this.resizeObserver = null;
    
    // Tooltip manager for globe interactivity
    this.tooltipManager = new TooltipManager();
  }

  /**
   * Initializes the narrative globe visualization
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   */
  async init() {
    const container = document.getElementById("dashboard-globe");
    if (!container) {
      console.warn("Narrative globe container not found");
      return;
    }

    try {
      await this.loadThreeJS();
      await this.renderGlobe(container);
    } catch (error) {
      console.error('Failed to initialize narrative globe:', error);
      this.showError(container, error.message);
    }
  }

  /**
   * Loads the Three.js library dynamically
   * @returns {Promise<void>} Promise that resolves when Three.js is loaded
   */
  async loadThreeJS() {
    if (window.THREE) {
      return; // Already loaded
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Three.js library'));
      document.head.appendChild(script);
    });
  }

  /**
   * Renders the globe visualization in the specified container
   * @param {HTMLElement} container - Container element to render the globe in
   * @returns {Promise<void>} Promise that resolves when rendering is complete
   */
  async renderGlobe(container) {
    // Validate WebGL support before proceeding
    if (!this.isWebGLSupported()) {
      this.showWebGLError(container);
      return;
    }

    // Clean up any existing globe instance
    this.cleanupGlobe(container);

    const fallback = container.querySelector("[data-globe-fallback]");
    if (!container) return;
    
    // Validate container dimensions
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 320;

    if (width <= 0 || height <= 0) {
      throw new Error('Invalid container dimensions');
    }

    // Setup container
    container.innerHTML = "";
    container.setAttribute("role", "img");
    container.setAttribute("aria-live", "off");
    container.setAttribute("aria-labelledby", "dashboard-globe-title");
    container.removeAttribute("aria-describedby");

    // Create Three.js scene
    this.scene = new window.THREE.Scene();
    
    this.camera = new window.THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 160;

    this.renderer = new window.THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1.5);
    container.appendChild(this.renderer.domElement);

    // Create globe mesh
    this.globeGeometry = new window.THREE.SphereGeometry(this.config.globeRadius, 48, 48);
    
    // Parse color from hex string if provided
    let globeColorNum = 0x1f293b; // Default color
    try {
      globeColorNum = parseInt(this.config.globeColor.replace(/^#/, ''), 16);
    } catch (e) {
      console.warn('Invalid globe color provided, using default');
    }
    
    this.globeMaterial = new window.THREE.MeshBasicMaterial({
      color: globeColorNum,
      wireframe: this.config.wireframe,
      opacity: this.config.globeOpacity,
      transparent: true,
    });
    
    this.globe = new window.THREE.Mesh(this.globeGeometry, this.globeMaterial);
    this.scene.add(this.globe);

    // Create particle system with optimized generation
    this.particleGeometry = new window.THREE.BufferGeometry();
    const positions = new Float32Array(this.config.particleCount * 3);
    const colors = new Float32Array(this.config.particleCount * 3);

    // Pre-compute random values to avoid repeated Math.random() calls
    const randomValues = new Array(this.config.particleCount * 3);
    for (let i = 0; i < randomValues.length; i++) {
      randomValues[i] = Math.random();
    }

    const color = new window.THREE.Color();
    let randomIdx = 0;

    for (let i = 0; i < this.config.particleCount; i++) {
      // Use pre-computed random values
      const lat = window.THREE.MathUtils.degToRad(randomValues[randomIdx++] * 180 - 90);
      const lon = window.THREE.MathUtils.degToRad(randomValues[randomIdx++] * 360);
      const radius = this.config.globeRadius + randomValues[randomIdx++] * 6;

      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Use pre-computed random value for activity
      const activity = randomValues[randomIdx - 1]; // Reuse the last random value
      // Validate HSL values to prevent invalid colors
      const hue = Math.max(0, Math.min(1, 0.56 - activity * 0.25));
      const saturation = 0.7;
      const lightness = Math.max(0, Math.min(1, 0.5 + activity * 0.2));

      color.setHSL(hue, saturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.particleGeometry.setAttribute("position", new window.THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute("color", new window.THREE.BufferAttribute(colors, 3));

    // Adjust particle count based on device performance
    this.adaptToPerformance();

    this.particleMaterial = new window.THREE.PointsMaterial({
      size: this.config.particleSize,
      vertexColors: true,
      opacity: 0.85,
      transparent: true,
      sizeAttenuation: true, // Make points smaller with distance for better performance
    });

    this.points = new window.THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.points);

    // Create halo effect
    this.haloGeometry = new window.THREE.SphereGeometry(this.config.globeRadius + 7, 32, 32);
    
    let haloColorNum = 0x667eea; // Default color
    try {
      haloColorNum = parseInt(this.config.haloColor.replace(/^#/, ''), 16);
    } catch (e) {
      console.warn('Invalid halo color provided, using default');
    }
    
    this.haloMaterial = new window.THREE.MeshBasicMaterial({
      color: haloColorNum,
      transparent: true,
      opacity: this.config.haloOpacity,
    });
    
    this.halo = new window.THREE.Mesh(this.haloGeometry, this.haloMaterial);
    this.scene.add(this.halo);

    // Set up animation and event handling
    this.setupAnimation();
    this.setupEventListeners();
    
    // Store reference for cleanup
    container._globeInstance = this;
  }

  /**
   * Sets up the globe animation loop
   * @private
   */
  setupAnimation() {
    const shouldReduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    
    if (!shouldReduceMotion) {
      const animate = () => {
        if (this.isPaused) return;
        
        if (this.globe) this.globe.rotation.y += 0.0009;
        if (this.points) this.points.rotation.y += 0.0014;
        if (this.halo) this.halo.rotation.y += 0.0006;
        
        this.renderFrame();
        this.animationFrameId = requestAnimationFrame(animate);
      };
      
      animate();
      
      // Create visibility change handler and store reference for cleanup
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.isPaused = true;
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
        } else if (this.isPaused) {
          this.isPaused = false;
          this.setupAnimation();
        }
      };
      
      document.addEventListener("visibilitychange", this.visibilityHandler);
    } else {
      // If motion reduction is preferred, render once
      this.renderFrame();
    }
  }

  /**
   * Renders a single frame of the visualization
   * @private
   */
  renderFrame() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Optimized animation loop with performance considerations
   * @private
   */
  setupAnimation() {
    const shouldReduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (!shouldReduceMotion) {
      // Store initial rotation values to reduce object property access in animation loop
      let globeRotation = 0;
      let pointsRotation = 0;
      let haloRotation = 0;

      // Check if we should use a lower frame rate for performance
      let frameCount = 0;
      const frameSkip = this.shouldSkipFrames() ? 2 : 0; // Skip frames on lower-end devices

      const animate = () => {
        if (this.isPaused) {
          this.animationFrameId = requestAnimationFrame(animate);
          return;
        }

        // Apply rotation updates
        if (this.globe) {
          globeRotation += 0.0009;
          this.globe.rotation.y = globeRotation;
        }

        if (this.points) {
          pointsRotation += 0.0014;
          this.points.rotation.y = pointsRotation;
        }

        if (this.halo) {
          haloRotation += 0.0006;
          this.halo.rotation.y = haloRotation;
        }

        this.renderFrame();

        // Skip frames if needed for performance
        if (frameSkip > 0) {
          frameCount = (frameCount + 1) % (frameSkip + 1);
          if (frameCount === 0) {
            this.animationFrameId = requestAnimationFrame(animate);
          } else {
            this.animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          this.animationFrameId = requestAnimationFrame(animate);
        }
      };

      animate();

      // Create visibility change handler and store reference for cleanup
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.isPaused = true;
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
        } else if (this.isPaused) {
          this.isPaused = false;
          this.setupAnimation();
        }
      };

      document.addEventListener("visibilitychange", this.visibilityHandler);
    } else {
      // If motion reduction is preferred, render once
      this.renderFrame();
    }
  }

  /**
   * Determines if we should skip frames based on device capabilities
   * @returns {boolean} Whether to skip frames for performance
   * @private
   */
  shouldSkipFrames() {
    // Check if the device is lower-end based on hardware concurrency and memory
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    // Additional checks could be implemented here
    return hardwareConcurrency <= 2;
  }

  /**
   * Dynamically adjusts globe parameters based on device performance
   * @private
   */
  adaptToPerformance() {
    // Check device capabilities to adjust visual complexity
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 4; // in GB

    // Calculate performance index (higher is better)
    const performanceIndex = (deviceMemory * hardwareConcurrency) / 8;

    // Adjust particle count based on performance (300 min, 1500 max)
    const maxParticles = 1500;
    const minParticles = 300;
    const adjustedParticleCount = Math.floor(
      Math.min(
        maxParticles,
        Math.max(
          minParticles,
          this.config.particleCount * performanceIndex
        )
      )
    );

    // Only update if necessary
    if (adjustedParticleCount !== this.config.particleCount) {
      // If particle count is different, we need to recreate the geometry with adjusted count
      if (adjustedParticleCount < this.config.particleCount) {
        // Reduce particle count by recreating geometry
        this.updateParticleGeometry(adjustedParticleCount);
      }
      // Update config with new particle count
      this.config.particleCount = adjustedParticleCount;
    }
  }

  /**
   * Updates the particle geometry with a new particle count
   * @param {number} newParticleCount - The new number of particles to generate
   * @private
   */
  updateParticleGeometry(newParticleCount) {
    // Dispose of existing geometry
    if (this.particleGeometry) {
      this.particleGeometry.dispose();
    }

    // Create new particle system with optimized generation
    this.particleGeometry = new window.THREE.BufferGeometry();
    const positions = new Float32Array(newParticleCount * 3);
    const colors = new Float32Array(newParticleCount * 3);

    // Pre-compute random values to avoid repeated Math.random() calls
    const randomValues = new Array(newParticleCount * 3);
    for (let i = 0; i < randomValues.length; i++) {
      randomValues[i] = Math.random();
    }

    const color = new window.THREE.Color();
    let randomIdx = 0;

    for (let i = 0; i < newParticleCount; i++) {
      // Use pre-computed random values
      const lat = window.THREE.MathUtils.degToRad(randomValues[randomIdx++] * 180 - 90);
      const lon = window.THREE.MathUtils.degToRad(randomValues[randomIdx++] * 360);
      const radius = this.config.globeRadius + randomValues[randomIdx++] * 6;

      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Use pre-computed random value for activity
      const activity = randomValues[randomIdx - 1]; // Reuse the last random value
      // Validate HSL values to prevent invalid colors
      const hue = Math.max(0, Math.min(1, 0.56 - activity * 0.25));
      const saturation = 0.7;
      const lightness = Math.max(0, Math.min(1, 0.5 + activity * 0.2));

      color.setHSL(hue, saturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.particleGeometry.setAttribute("position", new window.THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute("color", new window.THREE.BufferAttribute(colors, 3));

    // Update the points object
    if (this.points) {
      this.scene.remove(this.points);
      this.points.geometry.dispose();
    }

    this.points = new window.THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.points);
  }

  /**
   * Adds Level of Detail (LOD) by dynamically adjusting quality based on viewport size and performance
   */
  adjustLevelOfDetail() {
    const container = this.renderer?.domElement?.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const area = width * height;

    // Define thresholds for different levels of detail
    if (area < 100000) { // Small viewport
      // Reduce particle count by 30%
      const newCount = Math.max(300, Math.floor(this.config.originalParticleCount * 0.7));
      if (newCount !== this.config.particleCount) {
        this.config.particleCount = newCount;
        this.updateParticleGeometry(this.config.particleCount);
      }
    } else if (area > 400000) { // Large viewport
      // Increase particle count by 20% if device can handle it
      const newCount = Math.min(1500, Math.floor(this.config.originalParticleCount * 1.2));
      if (newCount !== this.config.particleCount) {
        this.config.particleCount = newCount;
        this.updateParticleGeometry(this.config.particleCount);
      }
    }
  }

  /**
   * Sets up event listeners for the globe
   * @private
   */
  setupEventListeners() {
    // Handle resize events
    this.resizeHandler = () => {
      const container = this.renderer?.domElement?.parentElement;
      if (container) {
        const newWidth = container.clientWidth || 420;
        const newHeight = container.clientHeight || 320;

        this.renderer.setSize(newWidth, newHeight);
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();

        // Adjust level of detail based on new viewport size
        this.adjustLevelOfDetail();
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.resizeHandler);
      const container = this.renderer?.domElement?.parentElement;
      if (container) {
        this.resizeObserver.observe(container);
      }
    } else {
      // Also add level of detail adjustment to window resize
      const originalResizeHandler = this.resizeHandler;
      this.resizeHandler = () => {
        originalResizeHandler();
        this.adjustLevelOfDetail();
      };
      window.addEventListener("resize", this.resizeHandler);
    }
  }

  /**
   * Checks if WebGL is supported in the current browser
   * @returns {boolean} True if WebGL is supported, false otherwise
   */
  isWebGLSupported() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Shows an error message in the globe container when WebGL is not supported
   * @param {HTMLElement} container - Container element to display the error in
   * @private
   */
  showWebGLError(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="globe-error">
        <h3>WebGL Not Supported</h3>
        <p>This visualization requires WebGL to run properly. Please use a modern browser with WebGL enabled.</p>
      </div>
    `;
    
    // Add CSS for error display if not present
    if (!document.getElementById('globe-error-styles')) {
      const style = document.createElement('style');
      style.id = 'globe-error-styles';
      style.textContent = `
        .globe-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          color: #f8fafc;
          text-align: center;
          background: rgba(15, 23, 42, 0.7);
        }
        
        .globe-error h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          color: #ef4444;
        }
        
        .globe-error p {
          margin: 0;
          font-size: 0.9rem;
          color: #cbd5e1;
          max-width: 320px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Shows an error message in the globe container
   * @param {HTMLElement} container - Container element to display the error in
   * @param {string} message - Error message to display
   * @private
   */
  showError(container, message) {
    if (!container) return;

    container.innerHTML = `
      <div class="globe-error">
        <h3>Error Loading Globe</h3>
        <p>${message}</p>
        <button class="retry-button" onclick="location.reload()">Try Again</button>
      </div>
    `;
    
    // CSS for the error display is added above in showWebGLError
  }

  /**
   * Cleans up resources used by the globe visualization
   * @param {HTMLElement} container - Container element that holds the globe
   */
  cleanupGlobe(container) {
    // Cancel animation frame if active
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Remove event listeners
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    
    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Dispose of geometries and materials
    if (this.globeGeometry) {
      this.globeGeometry.dispose();
      this.globeGeometry = null;
    }
    
    if (this.globeMaterial) {
      this.globeMaterial.dispose();
      this.globeMaterial = null;
    }
    
    if (this.particleGeometry) {
      this.particleGeometry.dispose();
      this.particleGeometry = null;
    }
    
    if (this.particleMaterial) {
      this.particleMaterial.dispose();
      this.particleMaterial = null;
    }
    
    if (this.haloGeometry) {
      this.haloGeometry.dispose();
      this.haloGeometry = null;
    }
    
    if (this.haloMaterial) {
      this.haloMaterial.dispose();
      this.haloMaterial = null;
    }
    
    // Remove renderer
    if (this.renderer) {
      if (container && this.renderer.domElement && container.contains(this.renderer.domElement)) {
        container.removeChild(this.renderer.domElement);
      }
      // Clean up renderer resources
      this.renderer.dispose();
      this.renderer = null;
    }
    
    // Clear scene objects
    if (this.scene) {
      if (this.globe) {
        this.scene.remove(this.globe);
        this.globe = null;
      }
      
      if (this.points) {
        this.scene.remove(this.points);
        this.points = null;
      }
      
      if (this.halo) {
        this.scene.remove(this.halo);
        this.halo = null;
      }
    }
    
    // Clear remaining references
    this.scene = null;
    this.camera = null;
    
    if (container) {
      // Remove instance reference
      delete container._globeInstance;
    }
  }

  /**
   * Cleans up all resources used by the globe component
   */
  destroy() {
    // Find the container and clean up if one exists
    const container = document.getElementById("dashboard-globe");
    if (container) {
      this.cleanupGlobe(container);
    }
    
    // Clean up tooltip manager if used
    if (this.tooltipManager) {
      this.tooltipManager.cleanupTooltips();
    }
    
    console.log('Narrative Globe resources cleaned up');
  }
}