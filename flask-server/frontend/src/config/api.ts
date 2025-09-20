// frontend/src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/',
    QUERY: '/query',
    TRAIN: '/train'
  }
};

// API service functions
export class ChatbotAPI {
  private static baseUrl = API_CONFIG.BASE_URL;

  static async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.HEALTH}`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  static async sendQuery(query: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.QUERY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  static async trainModel(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.TRAIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Training failed:', error);
      throw error;
    }
  }
}   