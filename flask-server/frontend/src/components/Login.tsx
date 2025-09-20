import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Palette, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth, UserType } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // Redirect after successful authentication
      if (userType === 'user') {
        navigate('/dashboard');
      } else {
        navigate('/artist');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      let errorMessage = 'Authentication failed';
      
      switch (err.code) {
        case 'auth/configuration-not-found':
          errorMessage = 'Firebase authentication is not properly configured. Please contact support.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || 'Authentication failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    
    setError('');
    setLoading(true);
    
    try {
      await loginWithGoogle(userType);
      
      // Redirect after successful Google authentication
      if (userType === 'user') {
        navigate('/dashboard');
      } else {
        navigate('/artist');
      }
    } catch (err: any) {
      console.error('Google authentication error:', err);
      let errorMessage = 'Google login failed';
      
      switch (err.code) {
        case 'auth/configuration-not-found':
          errorMessage = 'Google authentication is not properly configured. Please contact support.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || 'Google login failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Kala-Kaart
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3 text-center">
            Login as:
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUserType('user')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 text-center transform hover:-translate-y-1 hover:shadow-lg",
                userType === 'user'
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 shadow-md"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">User</div>
              <div className="text-xs text-gray-500">Find Artists</div>
            </button>
            <button
              onClick={() => setUserType('artist')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 text-center transform hover:-translate-y-1 hover:shadow-lg",
                userType === 'artist'
                  ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-md"
                  : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50"
              )}
            >
              <Palette className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Artist</div>
              <div className="text-xs text-gray-500">Manage Profile</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center transform hover:-translate-y-1",
                userType === 'user'
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl",
                loading ? "opacity-75 cursor-not-allowed transform-none" : ""
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              Sign In
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-3 w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};