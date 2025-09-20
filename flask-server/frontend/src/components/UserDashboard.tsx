import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, Users, Sparkles, Loader2, Globe, ChevronDown } from 'lucide-react';
import { EnhancedAIAssistant } from './EnhancedAIAssistant';
import { apiService } from '../services/apiService';
import type { Artist } from '../types';
// @ts-ignore
import { translations } from '../translations/languages.js';

export const UserDashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
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

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const statsResult = await apiService.getStatistics();
        setStats({
          totalArtists: statsResult.stats.total_artisans || 0,
          totalCrafts: statsResult.stats.unique_crafts || 0,
          totalStates: statsResult.stats.unique_states || 0,
        });
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Server temporarily unavailable');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  
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
            
            <div className="relative group">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border-2 border-amber-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 bg-white/80 backdrop-blur-sm text-sm font-semibold text-amber-700 transition-colors"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center text-amber-600 pointer-events-none group-hover:text-amber-800 transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
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
            <h3 className="3xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
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
            <div className="4xl floating" style={{animationDelay: '0.5s'}}>🕉</div>
            <div className="4xl floating" style={{animationDelay: '1s'}}>🏺</div>
            <div className="4xl floating" style={{animationDelay: '1.5s'}}>🧵</div>
            <div className="4xl floating" style={{animationDelay: '2s'}}>🎨</div>
          </div>
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
