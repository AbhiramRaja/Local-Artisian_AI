// Path: /Users/abhi/Desktop/Local-Artisian_AI/flask-server/frontend/src/services/apiService.ts

// API Service for connecting to the Flask backend
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8000';

// Define the data interfaces for the API.
// This is crucial for type safety in a TypeScript project.
interface ChatRequest {
  message: string;
  history: string[];
}

interface ChatResponse {
  intent: string;
  entities: any;
  message: string;
  llm_message?: string;
  artists: any[];
  suggestions: string[];
  stats?: any;
}

interface SearchRequest {
  query: string;
  max_results?: number;
}

interface SearchResponse {
  artists: any[];
  total: number;
  query: string;
}

interface StatisticsResponse {
  stats: any;
  message: string;
}

interface FilterRequest {
  state?: string;
  district?: string;
  craft_type?: string;
  gender?: string;
  age_min?: number;
  age_max?: number;
}

interface FilterResponse {
  artists: any[];
  total: number;
  filters_applied: any;
}

interface SimilarArtistsResponse {
  similar_artists: any[];
  reference_artisan: any;
}

interface UniqueValuesResponse {
  column: string;
  values: string[];
  count: number;
}

interface HealthResponse {
  status: string;
  message: string;
  data_status: string;
  total_artisans: number;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const defaultOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server might be slow or unavailable');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Unable to connect to server - please check if backend is running');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.makeRequest<HealthResponse>('/');
  }

  async chat(message: string, history: string[] = []): Promise<ChatResponse> {
    const request: ChatRequest = { message, history };
    return this.makeRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async searchArtisans(query: string, maxResults: number = 10): Promise<SearchResponse> {
    const request: SearchRequest = { query, max_results: maxResults };
    return this.makeRequest<SearchResponse>('/api/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getStatistics(state?: string, district?: string): Promise<StatisticsResponse> {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    
    const queryString = params.toString();
    const endpoint = `/api/statistics${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<StatisticsResponse>(endpoint);
  }

  async filterArtisans(filters: FilterRequest): Promise<FilterResponse> {
    return this.makeRequest<FilterResponse>('/api/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getSimilarArtists(artisanId: string, limit: number = 5): Promise<SimilarArtistsResponse> {
    return this.makeRequest<SimilarArtistsResponse>(
      `/api/similar/${encodeURIComponent(artisanId)}?limit=${limit}`
    );
  }

  async getUniqueValues(column: string): Promise<UniqueValuesResponse> {
    return this.makeRequest<UniqueValuesResponse>(
      `/api/unique-values/${encodeURIComponent(column)}`
    );
  }

  // Legacy method to maintain compatibility with your original setup
  async sendQuery(query: string): Promise<{ response: string; status: string }> {
    return this.makeRequest<{ response: string; status: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  StatisticsResponse,
  FilterRequest,
  FilterResponse,
  SimilarArtistsResponse,
  UniqueValuesResponse,
  HealthResponse,
};