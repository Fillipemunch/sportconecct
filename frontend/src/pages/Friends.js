import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { friendsAPI, sportsAPI } from '../services/api';
import { 
  Users, 
  Search, 
  UserPlus, 
  MessageCircle, 
  Calendar,
  Activity,
  MapPin,
  Star,
  Filter,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';

const Friends = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reload suggestions when search term changes
    if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [searchTerm, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, sportsData] = await Promise.all([
        friendsAPI.getAll(),
        sportsAPI.getAll()
      ]);
      
      setFriends(friendsData);
      setSports(sportsData);
      
      // Load initial suggestions
      if (activeTab === 'suggestions') {
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load friends data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggestionsData = await friendsAPI.getSuggestions(10, searchTerm);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFriend = async (userId) => {
    try {
      setActionLoading(userId);
      await friendsAPI.add(userId);
      await loadData(); // Reload data
      toast({
        title: t('common.success'),
        description: 'Friend added successfully!'
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || 'Failed to add friend',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      setActionLoading(friendId);
      await friendsAPI.remove(friendId);
      await loadData(); // Reload data
      toast({
        title: t('common.success'),
        description: 'Friend removed successfully!'
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || 'Failed to remove friend',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getSportInfo = (sportId) => {
    return sports.find(sport => sport.id === sportId) || { name: sportId, name_da: sportId, icon: '🏃', color: '#6B7280' };
  };

  const FriendCard = ({ friend, isSuggestion = false }) => {
    return (
      <Card className="bg-white/90 backdrop-blur hover:shadow-lg transition-all duration-200 border-0">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-gray-200">
                <AvatarImage src={friend.photo} alt={friend.name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white">
                  {friend.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {!isSuggestion && (
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{friend.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {friend.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{friend.location}</span>
                  </div>
                )}
                {friend.age && (
                  <span>• {friend.age} years</span>
                )}
              </div>
              
              {friend.sports && friend.sports.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {friend.sports.slice(0, 3).map(sportId => {
                    const sport = getSportInfo(sportId);
                    return sport ? (
                      <Badge key={sportId} variant="outline" className="text-xs" style={{ borderColor: sport.color, color: sport.color }}>
                        {sport.icon}
                      </Badge>
                    ) : null;
                  })}
                  {friend.sports.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{friend.sports.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {!isSuggestion && friend.mutual_events > 0 && (
                <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{friend.mutual_events} mutual events</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              {isSuggestion ? (
                <Button
                  size="sm"
                  onClick={() => handleAddFriend(friend.id)}
                  disabled={actionLoading === friend.id}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  {actionLoading === friend.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" disabled>
                    <MessageCircle size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRemoveFriend(friend.id)}
                    disabled={actionLoading === friend.id}
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    {actionLoading === friend.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserX size={14} />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            {t('nav.friends')}
          </h1>
          <p className="text-gray-600">Connect with fellow sports enthusiasts</p>
        </div>

        {/* Search */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="text-gray-400" size={20} />
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white/80 backdrop-blur-lg rounded-lg p-2 border border-white/20">
          <Button
            variant={activeTab === 'friends' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('friends')}
            className={`flex-1 ${
              activeTab === 'friends' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                : 'hover:bg-blue-50'
            }`}
          >
            <Users className="mr-2" size={16} />
            My Friends ({friends.length})
          </Button>
          <Button
            variant={activeTab === 'suggestions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 ${
              activeTab === 'suggestions' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                : 'hover:bg-blue-50'
            }`}
          >
            <UserPlus className="mr-2" size={16} />
            Suggestions ({suggestions.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'friends' ? (
          <>
            {/* Friends Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Users className="mx-auto mb-2" size={24} />
                  <p className="text-2xl font-bold">{friends.length}</p>
                  <p className="text-sm opacity-90">Total Friends</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Activity className="mx-auto mb-2" size={24} />
                  <p className="text-2xl font-bold">{friends.filter(f => f.status === 'online').length}</p>
                  <p className="text-sm opacity-90">Online Now</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Calendar className="mx-auto mb-2" size={24} />
                  <p className="text-2xl font-bold">{friends.reduce((sum, f) => sum + (f.mutual_events || 0), 0)}</p>
                  <p className="text-sm opacity-90">Mutual Events</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Star className="mx-auto mb-2" size={24} />
                  <p className="text-2xl font-bold">{Math.round(friends.reduce((sum, f) => sum + (f.mutual_events || 0), 0) / Math.max(friends.length, 1))}</p>
                  <p className="text-sm opacity-90">Avg Together</p>
                </CardContent>
              </Card>
            </div>

            {/* Friends List */}
            {filteredFriends.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-lg border-white/20">
                <CardContent className="text-center py-12">
                  <Users size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {searchTerm ? 'No friends found' : 'No friends yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Start connecting with other sports enthusiasts!'
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setActiveTab('suggestions')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <UserPlus className="mr-2" size={16} />
                      Find Friends
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map(friend => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Friend Suggestions */}
            <Card className="bg-white/80 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus size={20} />
                  <span>People you might know</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Connect with other SportConnect users who share your interests
                </p>
              </CardContent>
            </Card>

            {filteredSuggestions.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-lg border-white/20">
                <CardContent className="text-center py-12">
                  <UserPlus size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {searchTerm ? 'No suggestions found' : 'No suggestions available'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'We\'ll suggest people based on your sports interests and activity'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuggestions.map(user => (
                  <FriendCard key={user.id} friend={user} isSuggestion={true} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;