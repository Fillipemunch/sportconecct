import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { mockSports } from '../data/mock';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  DollarSign,
  Target,
  Plus
} from 'lucide-react';

const CreateEvent = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    titleDa: '',
    sport: '',
    date: '',
    time: '',
    location: '',
    address: '',
    description: '',
    descriptionDa: '',
    maxParticipants: '',
    skillLevel: '',
    price: '0'
  });

  const handleInputChange = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock event creation - in real app this would call backend
      const newEvent = {
        id: Date.now().toString(),
        ...eventForm,
        organizerId: user.id,
        organizer: user.name,
        currentParticipants: 1,
        participants: [user.id],
        status: 'active',
        tags: [
          eventForm.price === '0' ? 'free' : 'paid',
          eventForm.location.toLowerCase().includes('indoor') ? 'indoor' : 'outdoor',
          mockSports.find(s => s.id === eventForm.sport)?.name.toLowerCase() || 'sport'
        ],
        maxParticipants: parseInt(eventForm.maxParticipants),
        price: parseFloat(eventForm.price)
      };

      toast({
        title: t('common.success'),
        description: 'Event created successfully!'
      });

      // In real app, we would update the events list in backend
      navigate(`/events/${newEvent.id}`);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message || t('common.error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSportInfo = (sportId) => {
    return mockSports.find(sport => sport.id === sportId) || { name: sportId, nameDa: sportId, icon: '🏃', color: '#6B7280' };
  };

  const selectedSport = eventForm.sport ? getSportInfo(eventForm.sport) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Events
        </Button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
            {t('dashboard.createEvent')}
          </h1>
          <p className="text-gray-600">Organize an amazing sports event for your community</p>
        </div>

        {/* Create Event Form */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20">
          {selectedSport && (
            <div 
              className="h-24 bg-gradient-to-br"
              style={{ 
                background: `linear-gradient(135deg, ${selectedSport.color}80, ${selectedSport.color}60)` 
              }}
            >
              <div className="h-full flex items-center justify-center text-3xl">
                {selectedSport.icon}
              </div>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus size={20} />
              <span>Event Details</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sport Selection */}
              <div className="space-y-2">
                <Label>Sport *</Label>
                <Select onValueChange={(value) => handleInputChange('sport', value)} required>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSports.map(sport => (
                      <SelectItem key={sport.id} value={sport.id}>
                        <div className="flex items-center space-x-2">
                          <span>{sport.icon}</span>
                          <span>{language === 'da' ? sport.nameDa : sport.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title (English) *</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Morning Football Match"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleDa">Event Title (Danish) *</Label>
                  <Input
                    id="titleDa"
                    value={eventForm.titleDa}
                    onChange={(e) => handleInputChange('titleDa', e.target.value)}
                    placeholder="Morgen Fodboldkamp"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Date *</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span>Time *</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Location Name *</span>
                  </Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Fælledparken, Copenhagen"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={eventForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Fælledparken, 2100 København Ø, Denmark"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Participants and Skill Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Max Participants *</span>
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    max="100"
                    value={eventForm.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    placeholder="20"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Target size={16} />
                    <span>Skill Level *</span>
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('skillLevel', value)} required>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('skill.all')}</SelectItem>
                      <SelectItem value="beginner">{t('skill.beginner')}</SelectItem>
                      <SelectItem value="intermediate">{t('skill.intermediate')}</SelectItem>
                      <SelectItem value="advanced">{t('skill.advanced')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span>Price (DKK)</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={eventForm.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500">Leave as 0 for free events</p>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description (English) *</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Friendly football match for all skill levels. Bring your boots!"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionDa">Description (Danish) *</Label>
                  <Textarea
                    id="descriptionDa"
                    value={eventForm.descriptionDa}
                    onChange={(e) => handleInputChange('descriptionDa', e.target.value)}
                    placeholder="Venlig fodboldkamp for alle færdighedsniveauer. Tag dine støvler med!"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                  className="flex-1 sm:flex-none"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;