import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { eventsAPI, sportsAPI } from '../services/api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Plus,
  Filter,
  Grid,
  List,
  Loader2
} from 'lucide-react';

const Events = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadData();
  }, [sportFilter, dateFilter, skillFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (sportFilter !== 'all') params.sport = sportFilter;
      if (dateFilter !== 'all') params.date_filter = dateFilter;
      if (skillFilter !== 'all') params.skill_level = skillFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      
      const [eventsData, sportsData] = await Promise.all([
        eventsAPI.getAll(params),
        sportsAPI.getAll()
      ]);
      
      setEvents(eventsData);
      setSports(sportsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
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

  const handleJoinEvent = async (eventId, e) => {
    e.stopPropagation();
    try {
      await eventsAPI.join(eventId);
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const EventCard = ({ event }) => {
    const sport = getSportInfo(event.sport);
    const isParticipating = event.participants.includes('current-user-id'); // Will be fixed with real user context
    const isFull = event.current_participants >= event.max_participants;
    
    return (
      <Card 
        className="bg-white/90 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden group cursor-pointer"
        onClick={() => navigate(`/events/${event.id}`)}
      >
        <div 
          className="h-32 bg-gradient-to-br relative"
          style={{ 
            background: `linear-gradient(135deg, ${sport.color}80, ${sport.color}60)` 
          }}
        >
          <div className="h-full flex items-center justify-center text-4xl">
            {sport.icon}
          </div>
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-white/90 text-gray-700"
            >
              {t(`skill.${event.skill_level}`)}
            </Badge>
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

          <p className="text-sm text-gray-600 line-clamp-2">
            {language === 'da' ? event.description_da : event.description}
          </p>

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
                onClick={(e) => handleJoinEvent(event.id, e)}
              >
                {t('event.join')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EventListItem = ({ event }) => {
    const sport = getSportInfo(event.sport);
    const isParticipating = event.participants.includes('current-user-id'); // Will be fixed with real user context
    const isFull = event.current_participants >= event.max_participants;
    
    return (
      <Card 
        className="bg-white/90 backdrop-blur hover:shadow-lg transition-all duration-200 border-0 cursor-pointer"
        onClick={() => navigate(`/events/${event.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white"
              style={{ backgroundColor: sport.color }}
            >
              {sport.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg truncate">
                    {language === 'da' ? event.title_da : event.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {language === 'da' ? event.description_da : event.description}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className="ml-2"
                  style={{ color: sport.color, borderColor: sport.color }}
                >
                  {language === 'da' ? sport.name_da : sport.name}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>{event.current_participants}/{event.max_participants}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className="text-right">
                {event.price === 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {t('event.free')}
                  </Badge>
                ) : (
                  <span className="font-medium">{event.price} {t('event.price')}</span>
                )}
              </div>
              
              {isParticipating ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  ✓ Joined
                </Badge>
              ) : isFull ? (
                <Badge variant="outline" className="text-gray-500">
                  Event Full
                </Badge>
              ) : (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={(e) => handleJoinEvent(event.id, e)}
                >
                  {t('event.join')}
                </Button>
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
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent">
            {t('nav.events')}
          </h1>
          <Button
            onClick={() => navigate('/events/create')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Plus className="mr-2" size={16} />
            {t('dashboard.createEvent')}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/80 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="w-40 bg-white/80">
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

                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-40 bg-white/80">
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="beginner">{t('skill.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('skill.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('skill.advanced')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40 bg-white/80">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="today">{t('common.today')}</SelectItem>
                    <SelectItem value="tomorrow">{t('common.tomorrow')}</SelectItem>
                    <SelectItem value="thisWeek">{t('common.thisWeek')}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md bg-white/80">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Display */}
        {events.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-lg border-white/20">
            <CardContent className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No events found
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
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {events.map(event => 
              viewMode === 'grid' 
                ? <EventCard key={event.id} event={event} />
                : <EventListItem key={event.id} event={event} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;