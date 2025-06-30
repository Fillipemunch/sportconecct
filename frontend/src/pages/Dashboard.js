import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { eventsAPI, sportsAPI, userAPI } from '../services/api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter,
  Plus,
  Star,
  Trophy,
  Activity,
  Target,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, sportsData, statsData] = await Promise.all([
        eventsAPI.getAll(),
        sportsAPI.getAll(),
        userAPI.getStats()
      ]);
      
      setEvents(eventsData);
      setSports(sportsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.title_da.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || event.sport === sportFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(event.date).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'tomorrow' && new Date(event.date).toDateString() === new Date(Date.now() + 86400000).toDateString()) ||
                       (dateFilter === 'thisWeek' && new Date(event.date) <= new Date(Date.now() + 7 * 86400000));
    
    return matchesSearch && matchesSport && matchesDate;
  });

  const userEvents = events.filter(event => event.participants.includes(user?.id));

  const handleJoinEvent = async (eventId) => {
    try {
      await eventsAPI.join(eventId);
      await loadData(); // Reload data to get updated participants
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const getSportInfo = (sportId) => {
    return sports.find(sport => sport.id === sportId) || { name: sportId, name_da: sportId, icon: '🏃', color: '#6B7280' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    
    if (date.toDateString() === today.toDateString()) {
      return language === 'da' ? 'I dag' : 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return language === 'da' ? 'I morgen' : 'Tomorrow';
    } else {
      return date.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent">
            {t('dashboard.welcome')}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to get active and connect with your sports community?
          </p>
        </div>

        {/* Quick Stats */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-0 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-4 text-center">
                <Trophy className="mx-auto mb-2" size={24} />
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
                <Star className="mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{userStats.badges_count}</p>
                <p className="text-sm opacity-90">Badges</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-4 text-center">
                <Activity className="mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{userStats.sports_count}</p>
                <p className="text-sm opacity-90">Sports</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search size={20} />
              <span>{t('dashboard.discoverEvents')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/80 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="md:w-48 bg-white/80">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {sports.map(sport => (
                    <SelectItem key={sport.id} value={sport.id}>
                      <span className="mr-2">{sport.icon}</span>
                      {language === 'da' ? sport.name_da : sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="md:w-48 bg-white/80">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="today">{t('common.today')}</SelectItem>
                  <SelectItem value="tomorrow">{t('common.tomorrow')}</SelectItem>
                  <SelectItem value="thisWeek">{t('common.thisWeek')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            const sport = getSportInfo(event.sport);
            const isParticipating = event.participants.includes(user?.id);
            const isFull = event.current_participants >= event.max_participants;
            
            return (
              <Card 
                key={event.id} 
                className="bg-white/90 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div 
                  className="h-32 bg-gradient-to-br"
                  style={{ 
                    background: `linear-gradient(135deg, ${sport.color}80, ${sport.color}60)` 
                  }}
                >
                  <div className="h-full flex items-center justify-center text-4xl">
                    {sport.icon}
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg group-hover:text-orange-600 transition-colors">
                      {language === 'da' ? event.title_da : event.title}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="ml-2"
                      style={{ color: sport.color, borderColor: sport.color }}
                    >
                      {language === 'da' ? sport.name_da : sport.name}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{formatDate(event.date)}</span>
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users size={16} />
                        <span>{event.current_participants}/{event.max_participants} {t('event.participants')}</span>
                      </div>
                      <div className="text-right">
                        {event.price === 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t('event.free')}
                          </Badge>
                        ) : (
                          <span className="font-medium">{event.price} {t('event.price')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isParticipating ? (
                      <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-200">
                        ✓ Joined
                      </Badge>
                    ) : isFull ? (
                      <Badge variant="outline" className="w-full justify-center text-gray-500">
                        Event Full
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinEvent(event.id);
                        }}
                      >
                        {t('dashboard.joinEvent')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-lg border-white/20">
            <CardContent className="text-center py-12">
              <Target size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {t('dashboard.noEvents')}
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search filters or create a new event!
              </p>
              <Button
                onClick={() => navigate('/events/create')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Plus className="mr-2" size={16} />
                {t('dashboard.createEvent')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Your Upcoming Events */}
        {userEvents.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar size={20} />
                <span>{t('dashboard.upcomingEvents')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userEvents.slice(0, 3).map(event => {
                  const sport = getSportInfo(event.sport);
                  return (
                    <div 
                      key={event.id}
                      className="flex items-center space-x-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: sport.color }}
                      >
                        {sport.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {language === 'da' ? event.title_da : event.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.date)} at {event.time} • {event.location}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        {t('dashboard.viewEvent')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;