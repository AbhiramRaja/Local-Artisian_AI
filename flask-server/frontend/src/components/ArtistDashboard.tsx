import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Palette, 
  Edit, 
  Save, 
  LogOut,
  Camera,
  Star,
  Award,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ArtistDashboard: React.FC = () => {
  const { userProfile, logout, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    phone: userProfile?.phone || '',
    craftType: userProfile?.craftType || '',
    state: userProfile?.location?.state || '',
    district: userProfile?.location?.district || '',
    village: userProfile?.location?.village || ''
  });

  const handleSave = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        craftType: formData.craftType,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Artist Dashboard
              </h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-3 h-3 text-purple-600" />
              </button>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome, {userProfile.displayName || 'Artist'}!</h2>
              <p className="text-purple-100">Manage your artisan profile and connect with customers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {userProfile.displayName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      {userProfile.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {userProfile.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Craft Type
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.craftType}
                        onChange={(e) => setFormData(prev => ({ ...prev, craftType: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Pottery, Weaving, Wood Carving"
                      />
                    ) : (
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-purple-900 flex items-center border border-purple-200">
                        <Palette className="w-4 h-4 text-purple-600 mr-2" />
                        {userProfile.craftType || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your state"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {userProfile.location?.state || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your district"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {userProfile.location?.district || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Village/City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your village/city"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {userProfile.location?.village || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Profile Views</span>
                  </div>
                  <span className="text-lg font-bold text-blue-900">247</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Inquiries</span>
                  </div>
                  <span className="text-lg font-bold text-green-900">12</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-800">Rating</span>
                  </div>
                  <span className="text-lg font-bold text-purple-900">4.8★</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium">
                  Upload Portfolio Images
                </button>
                <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  View Public Profile
                </button>
                <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Manage Availability
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-lg font-bold text-orange-900 mb-2">💡 Profile Tips</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Complete your profile to get more visibility</li>
                <li>• Add high-quality photos of your work</li>
                <li>• Respond to inquiries promptly</li>
                <li>• Keep your contact information updated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};