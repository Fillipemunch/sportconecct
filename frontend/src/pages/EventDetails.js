import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { eventsAPI, sportsAPI } from '../services/api';
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
  DollarSign,
  Loader2
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [sports, setSports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadEventData();
    loadSports();
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const eventData = await eventsAPI.getById(id);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      
      // Check if it's a 404 error
      if (error.response?.status === 404) {
        toast({
          title: t('common.error'),
          description: 'Event not found',
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('common.error'),
          description: 'Failed to load event details',
          variant: 'destructive'
        });
      }
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadSports = async () => {
    try {
      const sportsData = await sportsAPI.getAll();
      setSports(sportsData);
    } catch (error) {
      console.error('Error loading sports:', error);
    }
  };

  const loadMessages = async () => {
    if (!event || !isParticipating) return;
    
    try {
      setLoadingMessages(true);
      const messagesData = await eventsAPI.getMessages(id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (showChat && event && isParticipating) {
      loadMessages();
    }
  }, [showChat, event]);

  const getSportInfo = (sportId) => {
    return sports.find(s => s.id === sportId) || { name: sportId, name_da: sportId, icon: '🏃', color: '#6B7280' };
  };

  const isParticipating = event?.participants?.includes(user?.id);
  const isFull = event?.current_participants >= event?.max_participants;
  const isOrganizer = event?.organizer_id === user?.id;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleJoinEvent = async () => {
    try {
      await eventsAPI.join(id);
      await loadEventData(); // Reload to get updated data
      toast({
        title: t('common.success'),
        description: 'Successfully joined the event!'
      });
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || 'Failed to join event',
        variant: 'destructive'
      });
    }
  };

  const handleLeaveEvent = async () => {
    try {
      await eventsAPI.leave(id);
      await loadEventData(); // Reload to get updated data
      toast({
        title: t('common.success'),
        description: 'Successfully left the event!'
      });
    } catch (error) {
      console.error('Error leaving event:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || 'Failed to leave event',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isParticipating || sendingMessage) return;

    try {
      setSendingMessage(true);
      const messageData = {
        message: newMessage,
        message_da: newMessage, // In real app, this could be translated
        event_id: id
      };
      
      await eventsAPI.sendMessage(id, messageData);
      setNewMessage('');
      await loadMessages(); // Reload messages
      toast({
        title: t('common.success'),
        description: 'Message sent!'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const sport = getSportInfo(event.sport);

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
                {t(`skill.${event.skill_level}`)}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {language === 'da' ? event.title_da : event.title}
                </h1>
                <Badge 
                  variant="outline" 
                  className="text-lg px-3 py-1"
                  style={{ color: sport.color, borderColor: sport.color }}
                >
                  {sport.icon} {language === 'da' ? sport.name_da : sport.name}
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
              {language === 'da' ? event.description_da : event.description}
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
                    <p className="text-gray-600">{event.current_participants}/{event.max_participants} {t('event.participants')}</p>
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
                      <span className="text-gray-600">{event.organizer_name}</span>
                      {isOrganizer && <Shield className="text-orange-500" size={16} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isParticipating ? (
                <>
                  {!isOrganizer && (
                    <Button
                      onClick={handleLeaveEvent}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {t('event.leave')}
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowChat(!showChat)}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <MessageCircle className="mr-2" size={16} />
                    {t('event.chat')}
                  </Button>
                </>
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
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card className="bg-white/90 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Participants ({event.current_participants})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.participant_details && event.participant_details.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {event.participant_details.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.photo} alt={participant.name} />
                      <AvatarFallback className="text-xs">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      {participant.id === event.organizer_id && (
                        <p className="text-xs text-orange-600">Organizer</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No participant details available</p>
            )}
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
                {loadingMessages ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map(message => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.user_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{message.user_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {language === 'da' ? message.message_da : message.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
                )}
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
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
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