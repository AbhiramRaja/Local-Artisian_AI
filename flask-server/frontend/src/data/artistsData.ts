import { Artist } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:8000');

let artistsData: Artist[] = [];
let isLoading = false;
let isLoaded = false;

// Enhanced API service - REMOVED CSV fallback that was causing errors
export const apiService = {
  async searchArtists(filters: any = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`🟢 API Online: Loaded ${result.artists.length} artists from server`);
      return result;
    } catch (error) {
      console.error('Search API error:', error);
      // Return empty result instead of trying to load CSV
      return {
        artists: [],
        total: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async chat(message: string, conversationHistory: string[] = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          conversation_history: conversationHistory 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🟢 Chat API Online: Response received from server');
      return result;
    } catch (error) {
      console.error('Chat API error:', error);
      // Return basic offline response without CSV dependency
      return this.generateBasicOfflineResponse(message);
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`Stats failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🟢 Stats API Online: Data received from server');
      return result;
    } catch (error) {
      console.error('Stats API error:', error);
      // Return basic stats instead of CSV-based ones
      return {
        total_artists: 0,
        unique_crafts: 0,
        unique_states: 0,
        unique_districts: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async getSimilarArtists(artistId: string, limit: number = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/artists/similar/${artistId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Similar artists failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Similar artists API error:', error);
      return {
        similar_artists: [],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`Categories failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Categories API error:', error);
      return {
        crafts: [],
        states: [],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Generate basic offline chat responses WITHOUT CSV dependency
  async generateBasicOfflineResponse(message: string) {
    const lowerMessage = message.toLowerCase();
    let intent = 'general';
    let responseMessage = '';
    const suggestions = [
      'Show me pottery artists',
      'Find artists in Rajasthan', 
      'Get database statistics',
      'Browse textile crafts'
    ];

    if (lowerMessage.includes('pottery') || lowerMessage.includes('pot')) {
      intent = 'search_craft';
      responseMessage = 'I can help you find pottery artists. Please ensure the backend server is connected for full search functionality.';
    } else if (lowerMessage.includes('rajasthan')) {
      intent = 'search_location';
      responseMessage = 'I can help you find artists in Rajasthan. Please ensure the backend server is connected for full search functionality.';
    } else if (lowerMessage.includes('stats') || lowerMessage.includes('statistic')) {
      intent = 'get_stats';
      responseMessage = 'I can provide database statistics. Please ensure the backend server is connected.';
    } else if (lowerMessage.includes('weaving') || lowerMessage.includes('textile')) {
      intent = 'search_craft';
      responseMessage = 'I can help you find textile and weaving artists. Please ensure the backend server is connected.';
    } else {
      responseMessage = 'I can help you find artisans and crafts. Please ensure the backend server is connected for full functionality.';
    }

    return {
      intent,
      entities: {},
      message: responseMessage,
      llm_message: 'Backend server connection needed for full AI features.',
      artists: [],
      suggestions,
      stats: {},
      status: 'offline'
    };
  }
};

// Load initial data from API only - no CSV fallback
const initializeData = async () => {
  if (isLoading || isLoaded) return;
  isLoading = true;
  
  try {
    console.log('🔄 Initializing data from API...');
    const result = await apiService.searchArtists({ limit: 100 });
    
    if (result.error) {
      console.error('❌ Failed to initialize data:', result.error);
      artistsData = [];
    } else {
      artistsData = result.artists || [];
      console.log(`✅ Loaded ${artistsData.length} artists from API`);
    }
    
    isLoaded = true;
  } catch (error) {
    console.error('❌ Failed to initialize data:', error);
    artistsData = [];
  } finally {
    isLoading = false;
  }
};

// Initialize data loading
initializeData();

export const getArtistsData = (): Artist[] => {
  return artistsData;
};

export const waitForData = async (): Promise<Artist[]> => {
  while (isLoading) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return artistsData;
};

export const getCraftTypes = (): string[] => {
  return [...new Set(artistsData.map(artist => artist.craft_type))];
};

export const getStates = (): string[] => {
  return [...new Set(artistsData.map(artist => artist.location?.state).filter(Boolean))];
};

export const getDistrictsByState = (state: string): string[] => {
  return [...new Set(artistsData
    .filter(artist => artist.location?.state === state)
    .map(artist => artist.location?.district)
    .filter(Boolean))];
};

export const getArtistsByState = (state: string): Artist[] => {
  return artistsData.filter(artist => 
    artist.location?.state?.toLowerCase().includes(state.toLowerCase())
  );
};

export const getArtistsByCity = (city: string): Artist[] => {
  return artistsData.filter(artist => 
    artist.location?.district?.toLowerCase().includes(city.toLowerCase()) ||
    artist.location?.village?.toLowerCase().includes(city.toLowerCase())
  );
};

export const getArtistsByCraft = (craft: string): Artist[] => {
  return artistsData.filter(artist => 
    artist.craft_type?.toLowerCase().includes(craft.toLowerCase())
  );
};

export const getArtistsByStateAndCraft = (state: string, craft: string): Artist[] => {
  return artistsData.filter(artist => 
    artist.location?.state?.toLowerCase().includes(state.toLowerCase()) &&
    artist.craft_type?.toLowerCase().includes(craft.toLowerCase())
  );
};