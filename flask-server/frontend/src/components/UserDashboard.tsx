import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, Users, Sparkles, Loader2, Globe } from 'lucide-react';
import { EnhancedAIAssistant } from './EnhancedAIAssistant';
import { apiService } from '../services/apiService';
import type { Artist } from '../types';
import { translations } from '../translations/languages';

export const UserDashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [executedQuery, setExecutedQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalCrafts: 0,
    totalStates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('en');
  const [isMaximized, setIsMaximized] = useState(false);

  const searchResultsRef = useRef<HTMLDivElement>(null);

  const t = (lang in translations ? translations[lang as keyof typeof translations] : translations.en);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  useEffect(() => {
    if (isChatOpen) {
      setShowChatModal(true);
    } else {
      setTimeout(() => {
        setShowChatModal(false);
      }, 300);
    }
  }, [isChatOpen]);

  // Add traditional Indian styling to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600&family=Kalam:wght@300;400;700&display=swap');
      
      body {
        font-family: 'Poppins', sans-serif;
      }

      .heritage-text {
        font-family: 'Kalam', cursive;
        text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.1);
      }
      
      .mandala-bg {
        background-image: 
          radial-gradient(circle at 20px 20px, rgba(139, 69, 19, 0.1) 2px, transparent 2px),
          radial-gradient(circle at 60px 60px, rgba(255, 193, 7, 0.08) 2px, transparent 2px),
          linear-gradient(45deg, rgba(255, 87, 34, 0.02) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(156, 39, 176, 0.02) 25%, transparent 25%);
        background-size: 80px 80px, 120px 120px, 60px 60px, 60px 60px;
      }
      
      .craft-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: linear-gradient(135deg, rgba(255,248,220,0.95) 0%, rgba(255,245,238,0.9) 100%);
        backdrop-filter: blur(10px);
        border: 2px solid transparent;
        background-clip: padding-box;
        position: relative;
        overflow: hidden;
      }
      
      .craft-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(255, 193, 7, 0.1) 0%, 
          rgba(255, 87, 34, 0.1) 25%, 
          rgba(156, 39, 176, 0.1) 50%, 
          rgba(63, 81, 181, 0.1) 75%, 
          rgba(76, 175, 80, 0.1) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .craft-card:hover::before {
        opacity: 1;
      }
      
      .craft-card:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: 0 25px 50px rgba(139, 69, 19, 0.2);
        border-color: rgba(255, 193, 7, 0.3);
      }
      
      .traditional-gradient {
        background: linear-gradient(135deg, 
          #667eea 0%, 
          #764ba2 25%, 
          #667eea 50%, 
          #f093fb 75%, 
          #f5576c 100%);
        position: relative;
        overflow: hidden;
      }
      
      .traditional-gradient::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      .traditional-gradient:hover::before {
        left: 100%;
      }
      
      .modern-gradient {
        background: linear-gradient(135deg, 
          #4facfe 0%, 
          #00f2fe 100%);
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
      }
      
      .success-gradient {
        background: linear-gradient(135deg, 
          #11998e 0%, 
          #38ef7d 100%);
        box-shadow: 0 8px 25px rgba(17, 153, 142, 0.3);
      }
      
      .warning-gradient {
        background: linear-gradient(135deg, 
          #ffecd2 0%, 
          #fcb69f 100%);
        box-shadow: 0 8px 25px rgba(252, 182, 159, 0.3);
      }
      
      .danger-gradient {
        background: linear-gradient(135deg, 
          #ff9a9e 0%, 
          #fecfef 100%);
        box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      .floating {
        animation: float 3s ease-in-out infinite;
      }
      
      .paisley-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4a574' fill-opacity='0.08'%3E%3Cpath d='M20 20c0-8.837-7.163-16-16-16S-12 11.163-12 20s7.163 16 16 16c4.418 0 8.418-1.791 11.314-4.686C18.209 28.418 20 24.418 20 20z'/%3E%3C/g%3E%3C/svg%3E");
      }
      
      .hero-pattern {
        background: 
          linear-gradient(45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(139, 69, 19, 0.03) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(139, 69, 19, 0.03) 75%),
          radial-gradient(circle at 30% 40%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(255, 87, 34, 0.1) 0%, transparent 50%);
        background-size: 40px 40px, 40px 40px, 40px 40px, 40px 40px, 200px 200px, 200px 200px;
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(103, 126, 234, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(103, 126, 234, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(103, 126, 234, 0);
        }
      }
      
      .button-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(0);
      }
      
      .button-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
      
      .button-press:active {
        transform: translateY(0) scale(0.98);
      }
      
      @keyframes chat-open-anim {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes chat-close-anim {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
      }
      .chat-open-anim {
        animation: chat-open-anim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .chat-close-anim {
        animation: chat-close-anim 0.3s ease-in forwards;
      }

      .soft-indian-flag-bg {
        background: linear-gradient(135deg, 
          rgba(255, 153, 51, 0.7) 0%,   /* Saffron with transparency */
          rgba(255, 255, 255, 0.6) 50%, /* White with transparency */
          rgba(19, 136, 8, 0.7) 100%    /* Green with transparency */
        );
        box-shadow: 0 10px 30px rgba(0,0,0,0.1); /* Soft shadow for depth */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Helper function to safely get artist location data
  const getArtistLocation = (artist: any) => {
    return {
      state: artist.location?.state || artist.state || 'State not specified',
      district: artist.location?.district || artist.district || 'District not specified',
      village: artist.location?.village || artist.village || ''
    };
  };

  // Helper function to safely get artist contact data
  const getArtistContact = (artist: any) => {
    return {
      phone: artist.contact?.phone || artist.contact_phone || artist.phone || 'Not available',
      email: artist.contact?.email || artist.contact_email || artist.email || 'Not available'
    };
  };

  // Helper function to safely get artist languages
  const getArtistLanguages = (artist: any) => {
    if (artist.languages && Array.isArray(artist.languages)) {
      return artist.languages;
    }
    if (artist.languages_spoken) {
      // Handle comma-separated string of languages
      return artist.languages_spoken.split(',').map((lang: string) => lang.trim()).filter(Boolean);
    }
    return ['Hindi']; // Default fallback
  };

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [artistsResult, statsResult] = await Promise.all([
          apiService.searchArtisans(""), 
          apiService.getStatistics() 
        ]);

        setArtists(artistsResult.artists || []);
        setStats({
          totalArtists: statsResult.stats.total_artisans || 0,
          totalCrafts: statsResult.stats.unique_crafts || 0,
          totalStates: statsResult.stats.unique_states || 0,
        });
        
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Server temporarily unavailable - using cached data');
        
        setArtists([]); 
        setStats({
          totalArtists: 0,
          totalCrafts: 0,
          totalStates: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle search and scroll when executedQuery changes
  useEffect(() => {
    if (!executedQuery.trim()) {
      setFilteredArtists(artists.slice(0, 12));
    } else {
      const filtered = artists.filter(artist => {
        const location = getArtistLocation(artist);
        const searchLower = executedQuery.toLowerCase();
        
        return (
          (artist.name || '').toLowerCase().includes(searchLower) ||
          (artist.craft_type || '').toLowerCase().includes(searchLower) ||
          location.state.toLowerCase().includes(searchLower) ||
          location.district.toLowerCase().includes(searchLower) ||
          location.village.toLowerCase().includes(searchLower)
        );
      });
      setFilteredArtists(filtered.slice(0, 20));
      
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [executedQuery, artists]);

  
  const LotusLogo: React.FC = () => (
    <div className="relative">
      <svg className="w-12 h-12 lotus-shadow floating" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lotusGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:"#ffd23f", stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:"#f7931e", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#ff6b35", stopOpacity:1}} />
          </radialGradient>
        </defs>
        <path d="M50 20 C35 25, 30 40, 50 50 C70 40, 65 25, 50 20 Z" fill="url(#lotusGradient)" opacity="0.9"/>
        <path d="M50 20 C40 30, 25 35, 30 55 C45 50, 50 35, 50 20 Z" fill="url(#lotusGradient)" opacity="0.8"/>
        <path d="M50 20 C60 30, 75 35, 70 55 C55 50, 50 35, 50 20 Z" fill="url(#lotusGradient)" opacity="0.8"/>
        <path d="M30 55 C35 70, 50 75, 50 50 C50 35, 65 40, 70 55 Z" fill="url(#lotusGradient)" opacity="0.7"/>
        <path d="M70 55 C65 70, 50 75, 50 50 C50 35, 65 40, 70 55 Z" fill="url(#lotusGradient)" opacity="0.7"/>
        <circle cx="50" cy="50" r="8" fill="#8b4513" opacity="0.8"/>
        <circle cx="50" cy="50" r="4" fill="#ffd23f"/>
      </svg>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 mandala-bg">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-4 border-double border-amber-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <LotusLogo />
              <div>
                <h1 className="text-3xl font-bold heritage-text bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent">{t.dashboard.appName}</h1>
                <p className="text-xs text-amber-700 heritage-text">Kala-Kaart</p>
              </div>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setExecutedQuery(searchQuery); 
              }}
              className="flex items-center space-x-4"
            >
              {/* Language Dropdown */}
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="pl-3 pr-8 py-2 border-2 border-amber-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 bg-white/80 backdrop-blur-sm text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 pointer-events-none">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t.dashboard.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-80 border-2 border-amber-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 bg-white/80 backdrop-blur-sm heritage-text"
                />
              </div>
              <button type="submit" className="modern-gradient text-white px-6 py-3 rounded-full button-hover button-press heritage-text font-semibold text-sm">
                🔍 {t.dashboard.searchButton}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-pattern py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="border-4 border-double border-amber-300 rounded-3xl p-8 mb-8 soft-indian-flag-bg backdrop-blur-sm">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 heritage-text text-gray-800">
              {t.dashboard.title}
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              {t.dashboard.titleSpan}
            </h3>
          </div>
          <p className="text-xl text-amber-800 mb-8 max-w-4xl mx-auto leading-relaxed heritage-text bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200">
            {t.dashboard.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="craft-card rounded-2xl p-8 border-2 border-amber-200 shadow-lg relative overflow-hidden">
              <div className="text-6xl mb-4 text-center floating">👥</div>
              <div className="text-4xl font-bold text-amber-900 mb-3 tabular-nums heritage-text text-center">{stats.totalArtists.toLocaleString()}+</div>
              <div className="text-amber-700 font-medium text-center heritage-text">
                {t.dashboard.stats.verified}
              </div>
            </div>
            <div className="craft-card rounded-2xl p-8 border-2 border-amber-200 shadow-lg relative overflow-hidden">
              <div className="text-6xl mb-4 text-center floating" style={{animationDelay: '0.5s'}}>🎨</div>
              <div className="text-4xl font-bold text-amber-900 mb-3 tabular-nums heritage-text text-center">{stats.totalCrafts}+</div>
              <div className="text-amber-700 font-medium text-center heritage-text">
                {t.dashboard.stats.crafts}
              </div>
            </div>
            <div className="craft-card rounded-2xl p-8 border-2 border-amber-200 shadow-lg relative overflow-hidden">
              <div className="text-6xl mb-4 text-center floating" style={{animationDelay: '1s'}}>🗺️</div>
              <div className="text-4xl font-bold text-amber-900 mb-3 tabular-nums heritage-text text-center">{stats.totalStates}+</div>
              <div className="text-amber-700 font-medium text-center heritage-text">
                {t.dashboard.stats.states}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => toggleChat()}
              className="success-gradient text-white px-10 py-4 rounded-full text-lg font-semibold button-hover button-press heritage-text border-2 border-white/30 flex items-center mx-auto"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t.dashboard.cta}
            </button>
            <p className="text-amber-700 heritage-text">{t.dashboard.ctaSubtitle}</p>
          </div>
          
          <div className="mt-12 flex justify-center space-x-8">
            <div className="text-4xl floating">🪔</div>
            <div className="text-4xl floating" style={{animationDelay: '0.5s'}}>🕉</div>
            <div className="text-4xl floating" style={{animationDelay: '1s'}}>🏺</div>
            <div className="text-4xl floating" style={{animationDelay: '1.5s'}}>🧵</div>
            <div className="text-4xl floating" style={{animationDelay: '2s'}}>🎨</div>
          </div>
        </div>
      </section>

      {/* Search Results Section - attach ref here */}
      <section ref={searchResultsRef} className="py-20 px-4 paisley-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <h3 className="text-5xl font-bold text-amber-900 mb-2 heritage-text">
                {executedQuery ? `Search Results (${filteredArtists.length})` : t.dashboard.featuredArtists}
              </h3>
              <h4 className="3xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
                {executedQuery ? "" : t.dashboard.featuredArtistsSubtitle}
              </h4>
            </div>
            <p className="text-amber-700 text-lg heritage-text bg-white/60 backdrop-blur-sm rounded-full px-8 py-3 inline-block border border-amber-200">
              🌟 {t.dashboard.featuredArtistsSubtitle} 🌟
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center craft-card rounded-3xl p-12 border-2 border-amber-200 bg-white/80 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                <p className="text-amber-800 heritage-text text-lg">{t.dashboard.stats.loading}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 craft-card border-2 border-amber-200 rounded-3xl mx-4">
              <div className="text-amber-500 mb-6">
                <Sparkles className="w-10 h-10 text-amber-600 mx-auto mb-4 floating" />
              </div>
              <h4 className="text-2xl font-bold text-amber-900 mb-3 heritage-text">{t.dashboard.stats.backup}</h4>
              <p className="text-amber-700 mb-4 max-w-md mx-auto heritage-text">
                {error} 
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map((artist) => {
                const location = getArtistLocation(artist);
                const contact = getArtistContact(artist);
                const languages = getArtistLanguages(artist);
                
                return (
                  <div key={artist.id || Math.random()} className="craft-card rounded-2xl p-6 border-2 border-amber-200 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-400 to-green-400 text-white px-3 py-1 text-xs font-medium rounded-bl-lg flex items-center heritage-text">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span>
                      {t.dashboard.available}
                    </div>
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center floating">
                        <Users className="w-10 h-10 text-orange-600" />
                      </div>
                      <h4 className="font-bold text-amber-900 text-lg mb-1 heritage-text leading-tight">{artist.name || 'Unknown Artist'}</h4>
                      <div className="flex items-center justify-center text-amber-700 text-sm heritage-text">
                        <span>{artist.age || 'N/A'} {t.dashboard.ageLabel}</span>
                        <span className="mx-2 text-amber-400">•</span>
                        <span className="capitalize">
                          {artist.gender === 'male' ? t.dashboard.genderMale : artist.gender === 'female' ? t.dashboard.genderFemale : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 via-purple-25 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🎨</div>
                          <div className="font-bold text-purple-900 text-sm heritage-text">{artist.craft_type || 'Traditional Craft'}</div>
                          <div className="text-xs text-purple-600 heritage-text">{t.dashboard.traditionalArtisan}</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-50 via-emerald-25 to-green-50 border-2 border-emerald-200 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📍</div>
                          <div className="font-bold text-emerald-900 text-sm heritage-text">{location.district}</div>
                          <div className="text-xs text-emerald-600 heritage-text">{location.state}, भारत</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="text-center mb-3">
                          <div className="text-3xl mb-2">📞</div>
                          <div className="text-xs text-blue-700 font-bold uppercase tracking-wide heritage-text">{t.dashboard.contactDetails}</div>
                        </div>
                        <div className="space-y-2 text-center">
                          <div className="bg-white rounded-lg p-2 border">
                            <span className="text-xs text-blue-600 font-medium heritage-text block">{t.dashboard.phoneLabel}</span>
                            <span className="text-sm font-mono text-blue-800 font-bold">{contact.phone}</span>
                          </div>
                          <div className="bg-white rounded-lg p-2 border">
                            <span className="text-xs text-blue-600 font-medium heritage-text block">{t.dashboard.emailLabel}</span>
                            <span className="text-xs text-blue-700 font-mono break-all">{contact.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-amber-600 font-medium mb-2 heritage-text">{t.dashboard.languagesLabel}</div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {languages.slice(0, 3).map((lang: string, index: number) => (
                            <span key={index} className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium border-2 border-amber-200 heritage-text">
                              {lang}
                            </span>
                          ))}
                          {languages.length > 3 && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium border-2 border-orange-200 heritage-text">
                              +{languages.length - 3} {t.dashboard.moreLanguages}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button className="flex-1 traditional-gradient text-white py-3 px-4 rounded-full font-semibold text-sm button-hover button-press heritage-text">
                          {t.dashboard.contactButton}
                        </button>
                        <button className="warning-gradient text-white p-3 rounded-full button-hover button-press border-2 border-white/30">
                          <Users className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {filteredArtists.length === 0 && !isLoading && (
            <div className="text-center py-16 craft-card border-2 border-amber-200 rounded-3xl mx-4">
              <div className="text-6xl mb-6 floating">🔍</div>
              <div className="text-amber-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold text-amber-800 mb-2 heritage-text">{t.dashboard.noArtists}</h4>
              <p className="text-amber-600 heritage-text">खोज में समायोजन करें या AI सहायक से मदद लें</p>
            </div>
          )}
        </div>
      </section>

      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`bg-white rounded-2xl w-full flex flex-col relative border-4 border-amber-300 shadow-2xl transition-all duration-300 transform ${
              isMaximized ? 'max-w-full h-full' : 'max-w-3xl h-[90vh]'
            } ${isChatOpen ? 'scale-100 opacity-100 chat-open-anim' : 'scale-95 opacity-0 chat-close-anim'}`}
          >
            {/* Pass state and functions as props */}
            <EnhancedAIAssistant 
              isMaximized={isMaximized} 
              setIsMaximized={setIsMaximized} 
              toggleChat={toggleChat}
            />
          </div>
        </div>
      )}

      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 modern-gradient text-white p-4 rounded-full shadow-lg button-hover button-press z-40 border-4 border-white/30"
          style={{
            animation: 'pulse 2s infinite'
          }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      <style>{`
        @keyframes chat-open-anim {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes chat-close-anim {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
        }
        .chat-open-anim {
          animation: chat-open-anim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .chat-close-anim {
          animation: chat-close-anim 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};
export default UserDashboard;