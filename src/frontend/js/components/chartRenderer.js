/**
 * Genaro DFT 2.0 - Chart Renderer Component
 * 
 * Component responsible for rendering D3.js charts with data from the API
 */

import { dataService } from '../services/dataService.js';

export class ChartRenderer {
  constructor() {
    this.dataService = dataService;
    this.charts = new Map(); // Store chart instances
  }

  async init() {
    console.log('Initializing Chart Renderer...');
    
    // Initialize charts based on data attributes in the DOM
    this.initNarrativeCharts();
    this.initSentimentCharts();
    this.initVolumeCharts();
    
    console.log('Chart Renderer initialized successfully');
  }

  /**
   * Initialize narrative-specific charts
   */
  async initNarrativeCharts() {
    const narrativeCharts = document.querySelectorAll('[data-chart-type="narrative"]');
    
    for (const chartEl of narrativeCharts) {
      const narrativeId = chartEl.getAttribute('data-narrative-id');
      if (narrativeId) {
        await this.renderNarrativeChart(chartEl, narrativeId);
      }
    }
  }

  /**
   * Render narrative chart with data from API
   */
  async renderNarrativeChart(chartEl, narrativeId) {
    try {
      // Fetch data from the API instead of using mock data
      const metrics = await this.dataService.fetchNarrativeMetrics(narrativeId);
      
      if (!metrics) {
        console.error(`Failed to fetch metrics for narrative ${narrativeId}`);
        return;
      }
      
      // Process the metrics data for visualization
      const processedData = this.processNarrativeData(metrics);
      
      // Create the visualization using D3.js
      this.createNarrativeVisualization(chartEl, processedData);
    } catch (error) {
      console.error(`Error rendering narrative chart for ${narrativeId}:`, error);
      
      // Render an error visualization
      this.renderErrorVisualization(chartEl, 'Failed to load narrative data');
    }
  }

  /**
   * Initialize sentiment charts
   */
  async initSentimentCharts() {
    const sentimentCharts = document.querySelectorAll('[data-chart-type="sentiment"]');
    
    for (const chartEl of sentimentCharts) {
      const narrativeId = chartEl.getAttribute('data-narrative-id');
      if (narrativeId) {
        await this.renderSentimentChart(chartEl, narrativeId);
      }
    }
  }

  /**
   * Render sentiment chart with data from API
   */
  async renderSentimentChart(chartEl, narrativeId) {
    try {
      // Fetch analytics results that contain sentiment data
      const analyticsResults = await this.dataService.fetchAnalyticsResults(narrativeId);
      
      if (!analyticsResults) {
        console.error(`Failed to fetch analytics for narrative ${narrativeId}`);
        return;
      }
      
      // Extract sentiment data
      const sentimentData = this.extractSentimentData(analyticsResults);
      
      // Create the sentiment visualization
      this.createSentimentVisualization(chartEl, sentimentData);
    } catch (error) {
      console.error(`Error rendering sentiment chart for ${narrativeId}:`, error);
      
      // Render an error visualization
      this.renderErrorVisualization(chartEl, 'Failed to load sentiment data');
    }
  }

  /**
   * Initialize volume charts
   */
  async initVolumeCharts() {
    const volumeCharts = document.querySelectorAll('[data-chart-type="volume"]');
    
    for (const chartEl of volumeCharts) {
      const narrativeId = chartEl.getAttribute('data-narrative-id');
      if (narrativeId) {
        await this.renderVolumeChart(chartEl, narrativeId);
      }
    }
  }

  /**
   * Render volume chart with data from API
   */
  async renderVolumeChart(chartEl, narrativeId) {
    try {
      // Fetch forecasts that contain volume predictions
      const analyticsResults = await this.dataService.fetchAnalyticsResults(narrativeId);
      
      if (!analyticsResults) {
        console.error(`Failed to fetch analytics for narrative ${narrativeId}`);
        return;
      }
      
      // Extract volume data
      const volumeData = this.extractVolumeData(analyticsResults);
      
      // Create the volume visualization
      this.createVolumeVisualization(chartEl, volumeData);
    } catch (error) {
      console.error(`Error rendering volume chart for ${narrativeId}:`, error);
      
      // Render an error visualization
      this.renderErrorVisualization(chartEl, 'Failed to load volume data');
    }
  }

  /**
   * Process narrative data for visualization
   */
  processNarrativeData(metrics) {
    // Convert API response to format suitable for D3.js
    if (!metrics.metrics) return [];
    
    // Example transformation - adjust based on actual API response format
    return metrics.metrics.map(metric => ({
      kpi: metric.kpi,
      value: metric.value,
      window: metric.window,
      breakdown: metric.breakdown || {}
    }));
  }

  /**
   * Extract sentiment data from analytics results
   */
  extractSentimentData(analyticsResults) {
    // Extract sentiment information from the analytics results
    if (!analyticsResults.forecasts) return [];
    
    // Example transformation - adjust based on actual API response format
    return analyticsResults.forecasts.map(forecast => ({
      date: forecast.forecast_horizon.start,
      sentiment: forecast.sentiment_predictions,
      confidence: forecast.confidence
    }));
  }

  /**
   * Extract volume data from analytics results
   */
  extractVolumeData(analyticsResults) {
    // Extract volume information from the analytics results
    if (!analyticsResults.forecasts) return [];
    
    // Example transformation - adjust based on actual API response format
    return analyticsResults.forecasts.map(forecast => ({
      period: forecast.forecast_horizon,
      predictedVolume: forecast.volume_predictions,
      confidence: forecast.confidence
    }));
  }

  /**
   * Create narrative visualization using D3.js
   */
  createNarrativeVisualization(chartEl, data) {
    // Clear previous content
    chartEl.innerHTML = '';
    
    // Create SVG element
    const width = chartEl.clientWidth || 600;
    const height = chartEl.clientHeight || 400;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'chart-svg');
    
    chartEl.appendChild(svg);
    
    // For now, just add a placeholder to show that the chart was created
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', width / 2);
    text.setAttribute('y', height / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = `Narrative Chart: ${data.length} data points`;
    text.setAttribute('class', 'chart-placeholder');
    
    svg.appendChild(text);
    
    // In a real implementation, this would use D3.js to create actual visualizations
    // e.g., bar charts, line charts, etc.
  }

  /**
   * Create sentiment visualization using D3.js
   */
  createSentimentVisualization(chartEl, data) {
    // Clear previous content
    chartEl.innerHTML = '';
    
    // Create SVG element
    const width = chartEl.clientWidth || 600;
    const height = chartEl.clientHeight || 400;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'chart-svg');
    
    chartEl.appendChild(svg);
    
    // For now, just add a placeholder to show that the chart was created
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', width / 2);
    text.setAttribute('y', height / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = `Sentiment Chart: ${data.length} data points`;
    text.setAttribute('class', 'chart-placeholder');
    
    svg.appendChild(text);
    
    // In a real implementation, this would use D3.js to create actual visualizations
    // e.g., sentiment gauges, time series charts, etc.
  }

  /**
   * Create volume visualization using D3.js
   */
  createVolumeVisualization(chartEl, data) {
    // Clear previous content
    chartEl.innerHTML = '';
    
    // Create SVG element
    const width = chartEl.clientWidth || 600;
    const height = chartEl.clientHeight || 400;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'chart-svg');
    
    chartEl.appendChild(svg);
    
    // For now, just add a placeholder to show that the chart was created
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', width / 2);
    text.setAttribute('y', height / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = `Volume Chart: ${data.length} forecasts`;
    text.setAttribute('class', 'chart-placeholder');
    
    svg.appendChild(text);
    
    // In a real implementation, this would use D3.js to create actual visualizations
    // e.g., bar charts, area charts for volume over time, etc.
  }

  /**
   * Render error visualization
   */
  renderErrorVisualization(chartEl, message) {
    // Clear previous content
    chartEl.innerHTML = '';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'chart-error';
    errorDiv.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div class="error-message">${message}</div>
      <button class="retry-btn" onclick="window.location.reload()">Retry</button>
    `;
    
    chartEl.appendChild(errorDiv);
  }

  /**
   * Update charts with new data
   */
  async updateCharts(narrativeId) {
    // Fetch updated data for the narrative
    const metrics = await this.dataService.fetchNarrativeMetrics(narrativeId);
    const analyticsResults = await this.dataService.fetchAnalyticsResults(narrativeId);
    
    // Find all charts for this narrative and update them
    const narrativeCharts = document.querySelectorAll(`[data-narrative-id="${narrativeId}"]`);
    
    for (const chartEl of narrativeCharts) {
      const chartType = chartEl.getAttribute('data-chart-type');
      
      switch (chartType) {
        case 'narrative':
          this.renderNarrativeChart(chartEl, narrativeId);
          break;
        case 'sentiment':
          if (analyticsResults) {
            const sentimentData = this.extractSentimentData(analyticsResults);
            this.createSentimentVisualization(chartEl, sentimentData);
          }
          break;
        case 'volume':
          if (analyticsResults) {
            const volumeData = this.extractVolumeData(analyticsResults);
            this.createVolumeVisualization(chartEl, volumeData);
          }
          break;
      }
    }
  }

  /**
   * Destroy and clean up resources
   */
  destroy() {
    // Clear all chart instances
    this.charts.clear();
    
    // Remove any event listeners or references to prevent memory leaks
    // (In a real implementation with D3, we'd call .remove() on all D3 selections)
  }
}