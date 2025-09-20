import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Phone, Mail, MapPin, Palette, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { Message, Artist, ChatResponse } from '../types';
import { getArtistsData, getCraftTypes, getStates, getDistrictsByState } from '../data/artistsData';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/',
    QUERY: '/query',
    TRAIN: '/train'
  }
};

// API Service
class ChatbotAPI {
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
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
    </div>
    <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
  </div>
);

const ArtistCard: React.FC<{ artist: Artist }> = ({ artist }) => (
  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <User className="w-4 h-4 mr-2 text-orange-600" />
        {artist.name}
      </h3>
      <span className="text-sm text-gray-600">{artist.age} years</span>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center text-sm text-gray-700">
        <Palette className="w-4 h-4 mr-2 text-purple-600" />
        <span className="font-medium">{artist.craft_type}</span>
      </div>
      
      <div className="flex items-center text-sm text-gray-700">
        <MapPin className="w-4 h-4 mr-2 text-green-600" />
        <span>{artist.location.district}, {artist.location.state}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-blue-700">
          <Phone className="w-4 h-4 mr-2" />
          <span className="font-mono">{artist.contact.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="truncate max-w-32">{artist.contact.email}</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Languages: {artist.languages.join(', ')}
      </div>
    </div>
  </div>
);

// Fallback local processing function
const processUserQueryLocally = (query: string): ChatResponse => {
  const lowerQuery = query.toLowerCase();
  
  // Greeting responses
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return {
      message: "Hello! I'm your Kala-Kaart AI assistant. I can help you find traditional Indian artists based on their craft type, location, or name. What are you looking for today?",
      suggestions: [
        "Show me carpet weaving artists",
        "Find artists in Uttar Pradesh",
        "Tell me about blue pottery artists",
        "Show artists with contact numbers"
      ]
    };
  }
  
  // Get artists data
  const artistsData = getArtistsData();
  
  // Search for specific artist by name
  const nameMatches = artistsData.filter((artist: Artist) => 
    artist.name.toLowerCase().includes(lowerQuery.replace(/find|show|tell|about|me/g, '').trim())
  );
  
  if (nameMatches.length > 0) {
    return {
      message: `I found ${nameMatches.length} artist(s) matching your search:`,
      artists: nameMatches,
      suggestions: ["Tell me about their craft", "Show more artists", "Find artists in the same area"]
    };
  }
  
  // Search by craft type
  const craftTypes = getCraftTypes();
  const matchedCraft = craftTypes.find(craft => 
    lowerQuery.includes(craft.toLowerCase()) || 
    craft.toLowerCase().includes(lowerQuery.replace(/artist|artisan|craftsman|find|show|tell|about|me/g, '').trim())
  );
  
  if (matchedCraft) {
    const craftArtists = artistsData.filter((artist: Artist) => artist.craft_type === matchedCraft);
    return {
      message: `Here are our ${matchedCraft} artists with their contact details:`,
      artists: craftArtists,
      suggestions: [`Find more ${matchedCraft} artists`, "Show artists in other states", "Tell me about other crafts"]
    };
  }
  
  // Search by state
  const states = getStates();
  const matchedState = states.find(state => 
    lowerQuery.includes(state.toLowerCase()) || 
    state.toLowerCase().includes(lowerQuery.replace(/artist|artisan|craftsman|find|show|tell|about|me|in|from/g, '').trim())
  );
  
  if (matchedState) {
    const stateArtists = artistsData.filter((artist: Artist) => artist.location.state === matchedState);
    const districts = getDistrictsByState(matchedState);
    return {
      message: `Found ${stateArtists.length} artists in ${matchedState}. Available in districts: ${districts.join(', ')}`,
      artists: stateArtists,
      suggestions: [`Show crafts in ${matchedState}`, "Find artists in other states", "Tell me about specific crafts"]
    };
  }
  
  // Default response with sample artists
  return {
    message: "I can help you find traditional Indian artists. Here are some featured artists with their contact information:",
    artists: artistsData.slice(0, 3),
    suggestions: [
      "Show all craft types",
      "Find artists by state", 
      "Search by artist name",
      "Show contact information"
    ]
  };
};

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Kala-Kaart AI assistant. I can help you discover traditional Indian artists and their contact information. Try asking me about specific crafts, locations, or artist names!",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [useBackend, setUseBackend] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await ChatbotAPI.healthCheck();
        setIsConnected(true);
        console.log('Backend connected successfully');
      } catch (error) {
        setIsConnected(false);
        console.error('Backend connection failed:', error);
      }
    };

    checkConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      let response: ChatResponse;

      if (useBackend && isConnected) {
        // Try to use backend API
        try {
          const backendResponse = await ChatbotAPI.sendQuery(currentInput);
          
          // Convert backend response to local format
          response = {
            message: backendResponse.response || "I received your message but couldn't process it properly.",
            suggestions: [
              "Try asking about specific crafts",
              "Ask about artists in different states",
              "Search for artist names",
              "Show contact information"
            ]
          };

          // If backend response includes detected language, add it to message
          if (backendResponse.language) {
            response.message += ` (Detected language: ${backendResponse.language})`;
          }

        } catch (backendError) {
          console.warn('Backend request failed, falling back to local processing:', backendError);
          response = processUserQueryLocally(currentInput);
        }
      } else {
        // Use local processing
        response = processUserQueryLocally(currentInput);
      }

      // Simulate some processing delay
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: JSON.stringify(response),
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorResponse: ChatResponse = {
        message: "I'm sorry, I encountered an error processing your request. Please try again.",
        suggestions: ["Try a different question", "Check your connection", "Ask about artists"]
      };

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: JSON.stringify(errorResponse),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="w-6 h-6 mr-3" />
            <div>
              <h2 className="font-semibold">Kala-Kaart AI Assistant</h2>
              <p className="text-sm text-orange-100">Find traditional artists & their contact info</p>
            </div>
          </div>
          
          {/* Connection Status & Mode Toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {isConnected ? (
                <CheckCircle className="w-4 h-4 text-green-300 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-300 mr-1" />
              )}
              <span className="text-xs">
                {isConnected ? 'Backend Connected' : 'Using Local Data'}
              </span>
            </div>
            
            <button
              onClick={() => setUseBackend(!useBackend)}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                useBackend 
                  ? "bg-orange-500 text-white" 
                  : "bg-orange-200 text-orange-800"
              )}
            >
              {useBackend ? 'AI Mode' : 'Local Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex message-slide-in",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.role === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              )}
            >
              {message.role === 'assistant' ? (
                <div>
                  {(() => {
                    try {
                      const response: ChatResponse = JSON.parse(message.content);
                      return (
                        <div>
                          <p className="mb-3">{response.message}</p>
                          
                          {response.artists && response.artists.length > 0 && (
                            <div className="mb-3">
                              {response.artists.map(artist => (
                                <ArtistCard key={artist.id} artist={artist} />
                              ))}
                            </div>
                          )}
                          
                          {response.suggestions && response.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {response.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    } catch {
                      return <p>{message.content}</p>;
                    }
                  })()}
                </div>
              ) : (
                <p>{message.content}</p>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-gray-100 rounded-lg">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={useBackend && isConnected ? "Ask me anything in any language..." : "Ask about artists, crafts, or locations..."}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={cn(
              "p-3 rounded-lg text-white transition-colors",
              !inputMessage.trim() || isTyping
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};