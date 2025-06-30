import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useToast } from '../hooks/use-toast';
import { Send, X } from 'lucide-react';

const ChatModal = ({ isOpen, onClose, friend }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'friend',
      text: `Hey! How are you doing?`,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      sender: 'me',
      text: 'Hi! I\'m good, thanks! How about you?',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate friend response after 2 seconds
    setTimeout(() => {
      const responses = [
        "That sounds great!",
        "Thanks for letting me know!",
        "Let's catch up soon!",
        "Hope to see you at the next event!",
        "Sounds like fun!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'friend',
        text: randomResponse,
        timestamp: new Date()
      }]);
    }, 2000);

    toast({
      title: 'Message sent!',
      description: `Your message was sent to ${friend?.name}`
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!friend) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={friend.photo} alt={friend.name} />
              <AvatarFallback>
                {friend.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span>{friend.name}</span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'me'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'me' ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 flex space-x-2 pt-3 border-t">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
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
            disabled={!message.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Send size={16} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;