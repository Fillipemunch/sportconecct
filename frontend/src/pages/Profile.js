import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { sportsAPI, userAPI } from '../services/api';
import { 
  User, 
  Edit, 
  Trophy, 
  Star, 
  Activity, 
  MapPin,
  Calendar,
  Target,
  Medal,
  Users,
  Plus,
  Check,
  X,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    location: user?.location || '',
    bio: user?.bio || '',
    sports: user?.sports || [],
    skill_level: user?.skill_level || ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        age: user.age || '',
        location: user.location || '',
        bio: user.bio || '',
        sports: user.sports || [],
        skill_level: user.skill_level || ''
      });
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [sportsData, statsData] = await Promise.all([
        sportsAPI.getAll(),
        userAPI.getStats()
      ]);
      setSports(sportsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const updateData = {
        name: editForm.name,
        age: parseInt(editForm.age) || user.age,
        location: editForm.location,
        bio: editForm.bio,
        sports: editForm.sports,
        skill_level: editForm.skill_level
      };

      const updatedUser = await userAPI.updateProfile(updateData);
      updateUser(updatedUser);
      await loadData(); // Reload stats
      
      toast({
        title: t('common.success'),
        description: 'Profile updated successfully!'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      age: user?.age || '',
      location: user?.location || '',
      bio: user?.bio || '',
      sports: user?.sports || [],
      skill_level: user?.skill_level || ''
    });
    setIsEditing(false);
  };

  const toggleSport = (sportId) => {
    setEditForm(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(id => id !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  const getSportInfo = (sportId) => {
    return sports.find(sport => sport.id === sportId) || { name: sportId, name_da: sportId, icon: '🏃', color: '#6B7280' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <Edit className="mr-2" size={16} />
                  {t('profile.editProfile')}
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <CardContent className="p-6 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white text-3xl">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-white/80 border-gray-300"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>{isEditing ? (
                      <Input
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                        className="w-20 h-8 bg-white/80"
                        min="13"
                        max="100"
                      />
                    ) : `${user?.age} years old`}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{isEditing ? (
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-48 h-8 bg-white/80"
                        placeholder="Location"
                      />
                    ) : user?.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target size={16} />
                    <span>{isEditing ? (
                      <Select 
                        value={editForm.skill_level} 
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, skill_level: value }))}
                      >
                        <SelectTrigger className="w-32 h-8 bg-white/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">{t('skill.beginner')}</SelectItem>
                          <SelectItem value="intermediate">{t('skill.intermediate')}</SelectItem>
                          <SelectItem value="advanced">{t('skill.advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : t(`skill.${user?.skill_level}`)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              {isEditing ? (
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself and your sports interests..."
                  className="w-full bg-white/80 border-gray-300 resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-gray-600">{user?.bio || 'No bio available'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-0 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-4 text-center">
                <Calendar className="mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{userStats.events_participated}</p>
                <p className="text-sm opacity-90">{t('profile.eventsParticipated')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white border-0 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-4 text-center">
                <Plus className="mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{userStats.events_created}</p>
                <p className="text-sm opacity-90">{t('profile.eventsCreated')}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white border-0 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-4 text-center">
                <Trophy className="mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{userStats.badges_count}</p>
                <p className="text-sm opacity-90">Badges</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-4 text-center">
                <Users className="mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{userStats.friends_count}</p>
                <p className="text-sm opacity-90">Friends</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sports */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity size={20} />
              <span>{t('profile.sports')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Select your favorite sports:</p>
                <div className="flex flex-wrap gap-2">
                  {sports.map(sport => (
                    <Badge
                      key={sport.id}
                      variant={editForm.sports.includes(sport.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        editForm.sports.includes(sport.id)
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'hover:bg-orange-50 hover:border-orange-300'
                      }`}
                      onClick={() => toggleSport(sport.id)}
                    >
                      <span className="mr-1">{sport.icon}</span>
                      {language === 'da' ? sport.name_da : sport.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {user?.sports?.map(sportId => {
                  const sport = getSportInfo(sportId);
                  return (
                    <Badge
                      key={sportId}
                      className="text-white px-3 py-2 text-sm"
                      style={{ backgroundColor: sport.color }}
                    >
                      <span className="mr-2">{sport.icon}</span>
                      {language === 'da' ? sport.name_da : sport.name}
                    </Badge>
                  );
                }) || (
                  <p className="text-gray-500">No sports selected</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal size={20} />
              <span>{t('profile.achievements')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.badges?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{badge}</h4>
                      <p className="text-sm text-gray-600">Achievement unlocked</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Medal size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No badges yet</h3>
                <p className="text-gray-500">Participate in events to earn your first badge!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;