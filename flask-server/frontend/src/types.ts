export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Artist {
  id: string;
  name: string;
  craft_type: string;
  location: {
    state: string;
    district: string;
    village: string;
  };
  contact: {
    email: string;
    phone: string;
    phone_available: boolean;
  };
  languages: string[];
  age: number;
  gender: string;
  government_id: string;
  cluster_code: string;
}

export interface ChatResponse {
  message: string;
  artists?: Artist[];
  suggestions?: string[];
}