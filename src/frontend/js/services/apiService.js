/**
 * Genaro DFT 2.0 - API Service Layer
 * 
 * Service layer to connect frontend components to backend API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface Narrative {
  id: string;
  title: string;
  risk_level: string;
  metrics: any[];
}

export interface SearchQuery {
  query: string;
  since?: string;
  until?: string;
  page?: number;
  page_size?: number;
}

export interface SearchResults {
  query: string;
  total: number;
  results: Array<{
    artifact: any;
    narrative: Narrative;
    score: number;
  }>;
}

export interface Forecast {
  narrative_id: string;
  forecast_horizon: { start: string; end: string };
  volume_predictions: any;
  sentiment_predictions: any;
  risk_predictions: any;
  confidence: number;
  model_used: string;
  timestamp: string;
}

export interface AnalyticsResults {
  narrative_id: string;
  risk_assessment: any;
  forecasts: Forecast[];
  correlations: any[];
  timestamp: string;
}

export class ApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make an API request with error handling
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: data.error || `HTTP Error: ${response.status}`,
          message: data.message || response.statusText,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get narratives with their metrics
   */
  async getNarratives(): Promise<ApiResponse<Narrative[]>> {
    return this.makeRequest<Narrative[]>('/narratives');
  }

  /**
   * Get metrics for a specific narrative
   */
  async getNarrativeMetrics(narrativeId: string, window: string = '7d'): Promise<ApiResponse<any>> {
    return this.makeRequest(`/narratives/${narrativeId}/metrics?window=${window}`);
  }

  /**
   * Search across all content
   */
  async search(query: SearchQuery): Promise<ApiResponse<SearchResults>> {
    const params = new URLSearchParams();
    params.append('query', query.query);
    if (query.since) params.append('since', query.since);
    if (query.until) params.append('until', query.until);
    if (query.page) params.append('page', query.page.toString());
    if (query.page_size) params.append('page_size', query.page_size.toString());

    return this.makeRequest<SearchResults>(`/search?${params.toString()}`);
  }

  /**
   * Get key performance indicators
   */
  async getKpis(filters?: any): Promise<ApiResponse<any[]>> {
    let endpoint = '/metrics/kpis';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      endpoint += `?${params.toString()}`;
    }
    return this.makeRequest<any[]>(endpoint);
  }

  /**
   * Get analytics results for a narrative
   */
  async getAnalyticsResults(narrativeId: string): Promise<ApiResponse<AnalyticsResults>> {
    // This would come from the analytics agent via the API
    return this.makeRequest<AnalyticsResults>(`/analytics/results?narrative_id=${narrativeId}`);
  }

  /**
   * Submit content for perception analysis
   */
  async analyzeContent(content: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/perception/analyze', {
      method: 'POST',
      body: JSON.stringify(content)
    });
  }

  /**
   * Submit a Genaro request (briefing, analysis, strategy, etc.)
   */
  async submitGenaroRequest(request: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/genaro/request', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get Genaro response
   */
  async getGenaroResponse(requestId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/genaro/response/${requestId}`);
  }

  /**
   * Request approval for an action
   */
  async requestApproval(action: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/approval/request', {
      method: 'POST',
      body: JSON.stringify(action)
    });
  }

  /**
   * Get system status and health
   */
  async getHealth(): Promise<ApiResponse<any>> {
    return this.makeRequest('/health');
  }

  /**
   * Get agent status
   */
  async getAgentStatus(agentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/agents/${agentId}/status`);
  }
}

// Create a singleton instance of the API service
export const apiService = new ApiService();