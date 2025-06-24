import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { mockEvents, mockSports, mockMessages, mockUsers } from '../data/mock';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft,
  MessageCircle,
  Send,
  User,
  Star,
  Shield,
  DollarSign
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const foundEvent = mockEvents.find(e => e.id === id);
    if (foundEvent) {
      setEvent(foundEvent);
      setMessages(mockMessages.filter(msg => msg.eventId === id));
    }
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  const sport = mockSports.find(s => s.id === event.sport) || { name: event.sport, nameDa: event.sport, icon: '🏃', color: '#6B7280' };
  const organizer = mockUsers.find(u => u.id === event.organizerId) || { name: event.organizer, photo: null };
  const isParticipating = event.participants.includes(user?.id);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const isOrganizer = event.organizerId === user?.id;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleJoinEvent = () => {
    setEvent(prev => ({
      ...prev,
      participants: [...prev.participants, user.id],
      currentParticipants: prev.currentParticipants + 1
    }));
  };

  const handleLeaveEvent = () => {
    setEvent(prev => ({
      ...prev,
      participants: prev.participants.filter(id => id !== user.id),
      currentParticipants: prev.currentParticipants - 1
    }));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && isParticipating) {
      const message = {
        id: Date.now().toString(),
        eventId: event.id,
        userId: user.id,
        userName: user.name,
        message: newMessage,
        messageDa: newMessage, // In real app, this would be translated
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Events
        </Button>

        {/* Event Header */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20 overflow-hidden">
          <div 
            className="h-48 bg-gradient-to-br relative"
            style={{ 
              background: `linear-gradient(135deg, ${sport.color}80, ${sport.color}60)` 
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              {sport.icon}
            </div>
            <div className="absolute top-4 right-4">
              <Badge 
                variant="secondary" 
                className="bg-white/90 text-gray-700 text-sm"
              >
                {t(`skill.${event.skillLevel}`)}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {language === 'da' ? event.titleDa : event.title}
                </h1>
                <Badge 
                  variant="outline" 
                  className="text-lg px-3 py-1"
                  style={{ color: sport.color, borderColor: sport.color }}
                >
                  {sport.icon} {language === 'da' ? sport.nameDa : sport.name}
                </Badge>
              </div>
              <div className="text-right">
                {event.price === 0 ? (
                  <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                    {t('event.free')}
                  </Badge>
                ) : (
                  <div className="flex items-center text-xl font-bold">
                    <DollarSign size={20} />
                    <span>{event.price} {t('event.price')}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-lg mb-6">
              {language === 'da' ? event.descriptionDa : event.description}
            </p>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-orange-500" size={20} />
                  <div>
                    <p className="font-medium">{t('event.date')}</p>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="text-orange-500" size={20} />
                  <div>
                    <p className="font-medium">{t('event.time')}</p>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="text-orange-500" size={20} />
                  <div>
                    <p className="font-medium">{t('event.participants')}</p>
                    <p className="text-gray-600">{event.currentParticipants}/{event.maxParticipants} {t('event.participants')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="text-orange-500 mt-1" size={20} />
                  <div>
                    <p className="font-medium">{t('event.location')}</p>
                    <p className="text-gray-600">{event.location}</p>
                    <p className="text-sm text-gray-500">{event.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="text-orange-500" size={20} />
                  <div>
                    <p className="font-medium">{t('event.organizer')}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={organizer.photo} alt={organizer.name} />
                        <AvatarFallback className="text-xs">
                          {organizer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-600">{organizer.name}</span>
                      {isOrganizer && <Shield className="text-orange-500" size={16} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isParticipating ? (
                <Button
                  onClick={handleLeaveEvent}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  {t('event.leave')}
                </Button>
              ) : isFull ? (
                <Button disabled className="flex-1">
                  Event Full
                </Button>
              ) : (
                <Button
                  onClick={handleJoinEvent}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  {t('event.join')}
                </Button>
              )}
              
              {isParticipating && (
                <Button
                  onClick={() => setShowChat(!showChat)}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <MessageCircle className="mr-2" size={16} />
                  {t('event.chat')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Participants ({event.currentParticipants})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {event.participants.map(participantId => {
                const participant = mockUsers.find(u => u.id === participantId) || 
                  { id: participantId, name: 'Unknown User', photo: null };
                
                return (
                  <div key={participantId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.photo} alt={participant.name} />
                      <AvatarFallback className="text-xs">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      {participantId === event.organizerId && (
                        <p className="text-xs text-orange-600">Organizer</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat Section */}
        {showChat && isParticipating && (
          <Card className="bg-white/90 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle size={20} />
                <span>{t('event.chat')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map(message => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{message.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {language === 'da' ? message.messageDa : message.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('event.sendMessage')}
                  className="flex-1 resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Send size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDetails;