import { useState, useEffect } from 'react';
import { MessageCircle, X, Search, Users, Palette, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { EnhancedAIAssistant } from './components/EnhancedAIAssistant';
import { getArtistsData, apiService } from './data/artistsData';
import type { Artist } from './types';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalCrafts: 0,
    totalStates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');

  const stateOptions = [
    'andhra pradesh','assam','bihar','chhattisgarh','goa','gujarat','haryana','himachal pradesh','jammu kashmir','jharkhand','karnataka','kerala','madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland','odisha','punjab','rajasthan','sikkim','tamil nadu','telangana','tripura','uttar pradesh','uttarakhand','west bengal','ladakh','delhi','chandigarh','puducherry'
  ];

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load artists and stats in parallel
        const [artistsResult, statsResult] = await Promise.all([
          apiService.searchArtists({ limit: 1000 }),
          apiService.getStats()
        ]);
        setArtists(artistsResult.artists);
        setStats({
          totalArtists: statsResult.total_artists || 0,
          totalCrafts: statsResult.unique_crafts || 0,
          totalStates: statsResult.unique_states || 0,
        });
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data from server');
        // Fallback to local data if available
        const localArtists = getArtistsData();
        setArtists(localArtists);
        setStats({
          totalArtists: localArtists.length,
          totalCrafts: new Set(localArtists.map(a => a.craft_type)).size,
          totalStates: new Set(localArtists.map(a => a.location.state)).size,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle search and state filter
  useEffect(() => {
    let filtered = artists;
    if (selectedState) {
      filtered = filtered.filter(artist => artist.location.state.toLowerCase() === selectedState.toLowerCase());
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.craft_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.location.village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredArtists(filtered.slice(0, selectedState || searchQuery ? 20 : 12));
  }, [searchQuery, artists, selectedState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Kala-Kaart
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center space-x-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search artists, crafts, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-700"
                >
                  <option value="">All States</option>
                  {stateOptions.map(state => (
                    <option key={state} value={state}>{state.charAt(0).toUpperCase() + state.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 text-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200"></div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#hero-pattern)"/>
          </svg>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Traditional Craft Discovery Platform
          </div>
          
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover India's 
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> Traditional Artists</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with skilled artisans preserving centuries-old crafts. Our AI assistant helps you find contact information and explore their beautiful work instantly.
          </p>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-3 tabular-nums">{stats.totalArtists.toLocaleString()}+</div>
              <div className="text-gray-600 font-medium">Verified Artists</div>
              <div className="text-sm text-gray-500 mt-2">Across India</div>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-3 tabular-nums">{stats.totalCrafts}+</div>
              <div className="text-gray-600 font-medium">Traditional Crafts</div>
              <div className="text-sm text-gray-500 mt-2">Ancient & Modern</div>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-3 tabular-nums">{stats.totalStates}+</div>
              <div className="text-gray-600 font-medium">States Covered</div>
              <div className="text-sm text-gray-500 mt-2">Pan-India Network</div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-orange-700 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center mx-auto"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Chat with AI Assistant
            </button>
            <p className="text-gray-500">Ask about artists, crafts, or get contact information instantly</p>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {searchQuery ? `Search Results (${filteredArtists.length})` : 'Featured Artists'}
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading artists from our AI-powered database...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl mx-4">
              <div className="text-amber-500 mb-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Running in Offline Mode</h4>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Server connection unavailable, but we're showing you cached artist data. 
                Full features will return when the backend is available.
              </p>
              <div className="space-y-2">
                <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Offline Mode Active
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map((artist) => (
              <div key={artist.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden relative">
                {/* Status Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-400 to-green-400 text-white px-3 py-1 text-xs font-medium rounded-bl-lg flex items-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span>
                  Available
                </div>
                
                {/* Artist Avatar Placeholder */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-orange-600 transition-colors leading-tight">{artist.name}</h4>
                    <div className="flex items-center text-gray-500 text-sm">
                      <span>{artist.age} years</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="capitalize">{artist.gender}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Craft Type - Enhanced */}
                  <div className="bg-gradient-to-r from-purple-50 via-purple-25 to-pink-50 border border-purple-100 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Palette className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-bold text-purple-900 text-sm">{artist.craft_type}</div>
                        <div className="text-xs text-purple-600">Traditional Artisan</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location - Enhanced */}
                  <div className="bg-gradient-to-r from-emerald-50 via-emerald-25 to-green-50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-900 text-sm">{artist.location.district}</div>
                        <div className="text-xs text-emerald-600">{artist.location.state}, India</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information - Redesigned */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-blue-700 font-bold uppercase tracking-wide">Contact Details</div>
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Direct</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">Phone:</span>
                        <span className="text-sm font-mono text-blue-800 font-bold bg-white px-2 py-1 rounded">{artist.contact.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">Email:</span>
                        <span className="text-xs text-blue-700 truncate max-w-32 bg-white px-2 py-1 rounded font-mono">{artist.contact.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Languages */}
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-2">Languages Spoken:</div>
                    <div className="flex flex-wrap gap-1">
                      {artist.languages.slice(0, 3).map((lang, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium border border-gray-200">
                          {lang}
                        </span>
                      ))}
                      {artist.languages.length > 3 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium border border-orange-200">
                          +{artist.languages.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                      Contact Artist
                    </button>
                    <button className="bg-gray-100 text-gray-600 p-3 rounded-xl hover:bg-gray-200 transition-all duration-200">
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
          
          {filteredArtists.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No artists found</h4>
              <p className="text-gray-500">Try adjusting your search or use the AI assistant for help</p>
            </div>
          )}
        </div>
      </section>

      {/* Chat Assistant */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col relative">
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <EnhancedAIAssistant />
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

export default App;