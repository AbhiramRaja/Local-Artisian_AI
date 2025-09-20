import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Phone, Mail, MapPin, Palette, Loader2, AlertCircle, Maximize, Minimize, X } from 'lucide-react';
import { apiService, ChatResponse } from '../services/apiService';

// Types
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  totalArtisans: number;
}

interface EnhancedAIAssistantProps {
  isMaximized: boolean;
  setIsMaximized: (isMax: boolean) => void;
  toggleChat: () => void;
}

// Utility function for class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Typing Indicator Component (re-styled with your new CSS)
const TypingIndicator: React.FC = () => (
  <div className="flex items-start space-x-3 chat-bubble">
    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm">🎨</span>
    </div>
    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-md">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-indicator"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-indicator" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-indicator" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </div>
);

// Error Message Component (re-styled with your new classes)
const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <span className="text-sm text-red-700">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// Connection Status Component (re-styled)
const ConnectionStatusIndicator: React.FC<{ status: ConnectionStatus; onReconnect: () => void }> = ({ 
  status, 
  onReconnect 
}) => (
  <div className="flex items-center space-x-2">
    <div className={cn(
      "w-3 h-3 rounded-full",
      status.isConnected ? "bg-green-400" : "bg-red-400"
    )}></div>
    <span className="text-sm text-gray-600">
      {status.isConnected ? "Online" : "Offline"}
    </span>
  </div>
);

// Artist Card Component (re-used from your original file)
const ArtistCard: React.FC<{ 
  artist: any; 
  onSimilarClick?: (artist: any) => void;
}> = ({ artist, onSimilarClick }) => {
  const getArtistData = (artist: any) => {
    return {
      id: artist.artisan_id || artist.id || Math.random().toString(),
      name: artist.name || 'Unknown Artist',
      age: artist.age || 'N/A',
      gender: artist.gender || 'N/A',
      craft_type: artist.craft_type || 'Traditional Craft',
      location: {
        village: artist.village || 'Unknown Village',
        district: artist.location?.district || artist.district || 'Unknown District', 
        state: artist.location?.state || artist.state || 'Unknown State'
      },
      contact: {
        phone: artist.phone || 'Not available',
        email: artist.email || 'Not available',
        phone_available: artist.phone_available !== false
      },
      languages: typeof artist.languages === 'string' 
        ? artist.languages.split(',').map((l: string) => l.trim()) 
        : (Array.isArray(artist.languages) ? artist.languages : ['Hindi']),
      government_id: artist.govt_id || artist.artisan_id || 'N/A',
      cluster_code: artist.artisan_cluster_code || 'N/A'
    };
  };

  const safeArtist = getArtistData(artist);
  
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all duration-200 chat-bubble">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <User className="w-4 h-4 mr-2 text-orange-600" />
          {safeArtist.name}
        </h3>
        <span className="text-sm text-gray-600">{safeArtist.age} years, {safeArtist.gender}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-700">
          <Palette className="w-4 h-4 mr-2 text-purple-600" />
          <span className="font-medium">{safeArtist.craft_type}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-green-600" />
          <span>{safeArtist.location.village}, {safeArtist.location.district}, {safeArtist.location.state}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-blue-700">
            <Phone className="w-4 h-4 mr-2" />
            <span className="font-mono text-xs">{safeArtist.contact.phone}</span>
            {!safeArtist.contact.phone_available && (
              <span className="text-xs text-gray-500 ml-1">(Limited)</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate max-w-24 text-xs">{safeArtist.contact.email}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Languages: {safeArtist.languages.join(', ')}
        </div>
        
        <div className="text-xs text-gray-400">
          ID: {safeArtist.government_id} | Cluster: {safeArtist.cluster_code}
        </div>
        
        {onSimilarClick && (
          <button
            onClick={() => onSimilarClick(artist)}
            className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors"
          >
            Find Similar Artists
          </button>
        )}
      </div>
    </div>
  );
};


// Main Component
export const EnhancedAIAssistant: React.FC<EnhancedAIAssistantProps> = ({ isMaximized, setIsMaximized, toggleChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    message: 'Connecting...',
    totalArtisans: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Initialize connection and welcome message
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const health = await apiService.healthCheck();
      setConnectionStatus({
        isConnected: health.status === 'healthy',
        message: health.message,
        totalArtisans: health.total_artisans
      });

      // Set welcome message if connected and no messages exist
      if (health.status === 'healthy' && messages.length === 0) {
        const welcomeMessage: Message = {
          id: '1',
          content: JSON.stringify({
            message: `Hello! I'm your Kala-Kaart AI assistant powered by our live backend server with ${health.total_artisans.toLocaleString()}+ real artisan profiles! I can help you discover traditional Indian artists, search by crafts and locations, provide database statistics, and answer questions about our comprehensive database.`,
            suggestions: [
              "Show me pottery artists",
              "Find artists in Rajasthan", 
              "Get database statistics",
              "Browse textile crafts"
            ],
            llm_message: `🟢 Online mode active: Connected to live backend server with real-time AI responses and comprehensive artisan database (${health.total_artisans.toLocaleString()} artists loaded).`
          }),
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus({
        isConnected: false,
        message: err instanceof Error ? err.message : 'Connection failed',
        totalArtisans: 0
      });
      setError('Unable to connect to AI backend. Please check if the server is running.');
    }
  };

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
    setError(null);

    try {
      const newHistory = [...conversationHistory, currentInput];
      setConversationHistory(newHistory);
      const response: ChatResponse = await apiService.chat(currentInput, newHistory);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: JSON.stringify(response),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory(prev => [...prev, response.message]);
      
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to get response: ${errorMessage}`);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: JSON.stringify({
          message: "I apologize, but I'm having trouble connecting to my AI engine. This could be due to server issues or network problems.",
          suggestions: [
            "Retry your question", 
            "Check server connection", 
            "Try a simpler query",
            "Restart the backend server"
          ],
          llm_message: "🔴 Connection error: Unable to reach the backend RAG system. Please ensure the Flask server is running on the correct port."
        }),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
    } finally {
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

  const handleSimilarArtistsClick = async (artist: any) => {
    try {
      setIsTyping(true);
      setError(null);
      
      const artisanId = artist.artisan_id || artist.id;
      if (!artisanId) {
        throw new Error('Artist ID not found');
      }
      
      const response = await apiService.getSimilarArtists(artisanId, 5);
      
      const similarMessage: Message = {
        id: Date.now().toString(),
        content: JSON.stringify({
          message: `Here are artists similar to ${response.reference_artisan?.name || 'the selected artist'}:`,
          artists: response.similar_artists || [],
          suggestions: [
            "More artists from same craft",
            "Artists in same location",
            "Search different criteria",
            "Get contact details"
          ],
          llm_message: `Found ${response.similar_artists?.length || 0} similar artists based on craft type and location matching.`
        }),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, similarMessage]);
    } catch (err) {
      console.error('Similar artists error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to find similar artists: ${errorMessage}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReconnect = () => {
    checkConnection();
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header with logo, title, and buttons */}
      <div className="bg-white shadow-lg rounded-b-2xl px-6 py-4 border-b-4 border-amber-400 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">🎨</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ArtisanConnect</h1>
            <p className="text-sm text-gray-600">Find local craftspeople & custom creations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2 hover:bg-amber-200 rounded-full transition-colors border-2 border-amber-300 bg-white"
          >
            {isMaximized ? <Minimize className="w-5 h-5 text-amber-700" /> : <Maximize className="w-5 h-5 text-amber-700" />}
          </button>
          <button
            onClick={toggleChat}
            className="p-2 hover:bg-amber-200 rounded-full transition-colors border-2 border-amber-300 bg-white"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 border-b">
          <ErrorMessage message={error} onRetry={handleReconnect} />
        </div>
      )}

      {/* Chat Messages */}
      <div id="chatContainer" className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start chat-bubble",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 bg-gradient-to-r from-amber-500 to-orange-500">
                <span className="text-white text-sm">🎨</span>
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 shadow-md",
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
                  : 'bg-white text-gray-800 rounded-tl-md',
                isMaximized ? 'max-w-xl' : 'max-w-md' // Conditional class for width
              )}
            >
              {message.role === 'assistant' ? (
                <div>
                  {(() => {
                    try {
                      const response: ChatResponse = JSON.parse(message.content);
                      return (
                        <div>
                          <p className="mb-3 text-gray-800">{response.message}</p>
                          
                          {response.llm_message && (
                            <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                              <p className="text-sm text-blue-800">{response.llm_message}</p>
                            </div>
                          )}
                          
                          {response.artists && response.artists.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm text-gray-600 mb-2 font-medium">
                                📋 Found {response.artists.length} artist(s):
                              </div>
                              <div className="max-h-80 overflow-y-auto">
                                {response.artists.map((artist: any, index: number) => (
                                  <ArtistCard 
                                    key={artist.artisan_id || artist.id || index} 
                                    artist={artist} 
                                    onSimilarClick={handleSimilarArtistsClick}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {response.stats && Object.keys(response.stats).length > 0 && (
                            <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                                📊 Database Statistics:
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm text-green-700">
                                {response.stats.total_artisans && (
                                  <div className="flex justify-between">
                                    <span>Total Artists:</span>
                                    <span className="font-mono font-bold">{response.stats.total_artisans.toLocaleString()}</span>
                                  </div>
                                )}
                                {response.stats.states && Object.keys(response.stats.states).length > 0 && (
                                  <div className="flex justify-between">
                                    <span>States:</span>
                                    <span className="font-mono font-bold">{Object.keys(response.stats.states).length}</span>
                                  </div>
                                )}
                                {response.stats.craft_types && Object.keys(response.stats.craft_types).length > 0 && (
                                  <div className="flex justify-between">
                                    <span>Crafts:</span>
                                    <span className="font-mono font-bold">{Object.keys(response.stats.craft_types).length}</span>
                                  </div>
                                )}
                                {response.stats.districts && Object.keys(response.stats.districts).length > 0 && (
                                  <div className="flex justify-between">
                                    <span>Districts:</span>
                                    <span className="font-mono font-bold">{Object.keys(response.stats.districts).length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {response.suggestions && response.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {response.suggestions.map((suggestion: string, index: number) => (
                                <button
                                  key={`suggestion-${index}`}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    } catch {
                      return <p className="text-gray-800">{message.content}</p>;
                    }
                  })()}
                </div>
              ) : (
                <p className="text-white">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-t-2xl shadow-lg">
        {/* The form, input, and button were converted to React components */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              id="messageInput"
              placeholder="Ask about local artisans, custom orders, or browse crafts..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping || !connectionStatus.isConnected}
            />
          </div>
          <button
            type="submit"
            className={cn(
              "bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg",
              !inputMessage.trim() || isTyping || !connectionStatus.isConnected
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
            disabled={!inputMessage.trim() || isTyping || !connectionStatus.isConnected}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            )}
          </button>
        </form>
        
        <div className="flex items-center justify-end mt-3 text-xs text-gray-500">
          <span className="text-gray-400">Press Enter to send</span>
        </div>
      </div>

      {/* CSS from your HTML file */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .chat-bubble {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .typing-indicator {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        .ml-13 {
            margin-left: 3.25rem;
        }
      `}</style>
    </div>
  );
};