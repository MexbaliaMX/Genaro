/**
 * Genaro DFT 2.0 - Data Service
 * 
 * Service to manage data flow between frontend components and API
 */

import { apiService } from './apiService.js';

export class DataService {
  constructor() {
    this.apiService = apiService;
  }

  /**
   * Fetch narrative data and cache it
   */
  async fetchNarratives() {
    try {
      const response = await this.apiService.getNarratives();
      
      if (response.success) {
        // Cache the data
        this.cacheNarratives(response.data);
        return response.data;
      } else {
        console.error('Failed to fetch narratives:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching narratives:', error);
      return [];
    }
  }

  /**
   * Fetch metrics for a specific narrative
   */
  async fetchNarrativeMetrics(narrativeId, timeWindow = '7d') {
    try {
      const response = await this.apiService.getNarrativeMetrics(narrativeId, timeWindow);
      
      if (response.success) {
        this.cacheNarrativeMetrics(narrativeId, response.data);
        return response.data;
      } else {
        console.error(`Failed to fetch metrics for narrative ${narrativeId}:`, response.error);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching metrics for narrative ${narrativeId}:`, error);
      return null;
    }
  }

  /**
   * Fetch search results
   */
  async fetchSearchResults(query, options = {}) {
    try {
      const searchQuery = {
        query,
        ...options
      };
      
      const response = await this.apiService.search(searchQuery);
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Search failed:', response.error);
        return { results: [], total: 0, query };
      }
    } catch (error) {
      console.error('Error performing search:', error);
      return { results: [], total: 0, query };
    }
  }

  /**
   * Fetch KPIs
   */
  async fetchKpis(filters = {}) {
    try {
      const response = await this.apiService.getKpis(filters);
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Failed to fetch KPIs:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return [];
    }
  }

  /**
   * Submit content for analysis
   */
  async analyzeContent(content) {
    try {
      const response = await this.apiService.analyzeContent(content);
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Content analysis failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    }
  }

  /**
   * Fetch analytics results for a narrative
   */
  async fetchAnalyticsResults(narrativeId) {
    try {
      const response = await this.apiService.getAnalyticsResults(narrativeId);
      
      if (response.success) {
        return response.data;
      } else {
        console.error(`Failed to fetch analytics results for narrative ${narrativeId}:`, response.error);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching analytics results for narrative ${narrativeId}:`, error);
      return null;
    }
  }

  /**
   * Submit a Genaro request
   */
  async submitGenaroRequest(request) {
    try {
      const response = await this.apiService.submitGenaroRequest(request);
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Genaro request failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error submitting Genaro request:', error);
      return null;
    }
  }

  /**
   * Cache narratives data
   */
  cacheNarratives(narratives) {
    // In a real implementation, this might use localStorage or a more sophisticated caching mechanism
    sessionStorage.setItem('narratives', JSON.stringify(narratives));
  }

  /**
   * Cache narrative metrics
   */
  cacheNarrativeMetrics(narrativeId, metrics) {
    // Cache metrics for a specific narrative
    sessionStorage.setItem(`metrics-${narrativeId}`, JSON.stringify(metrics));
  }

  /**
   * Get cached narratives
   */
  getCachedNarratives() {
    const cached = sessionStorage.getItem('narratives');
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Get cached metrics for a narrative
   */
  getCachedNarrativeMetrics(narrativeId) {
    const cached = sessionStorage.getItem(`metrics-${narrativeId}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Clear caches
   */
  clearCaches() {
    // Clear all cached data
    for (let key in sessionStorage) {
      if (key.startsWith('metrics-') || key === 'narratives') {
        sessionStorage.removeItem(key);
      }
    }
  }
}

// Create a singleton instance of the data service
export const dataService = new DataService();