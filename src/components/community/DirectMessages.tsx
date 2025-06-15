
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, Image, MoreHorizontal } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export const DirectMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      user: {
        name: 'Sarah Connor',
        username: '@sarahc',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        isOnline: true
      },
      lastMessage: 'Have you seen the new episode?',
      lastMessageTime: new Date(Date.now() - 10 * 60 * 1000),
      unreadCount: 2
    },
    {
      id: '2',
      user: {
        name: 'John Wick',
        username: '@johnw',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        isOnline: false
      },
      lastMessage: 'Thanks for the recommendation!',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: 'Sarah Connor',
      content: 'Hey! Did you watch the latest episode of The Last of Us?',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      isOwn: false
    },
    {
      id: '2',
      sender: 'You',
      content: 'Yes! It was incredible. The cinematography was amazing.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isOwn: true
    },
    {
      id: '3',
      sender: 'Sarah Connor',
      content: 'Have you seen the new episode?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Add message logic here
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {conversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors ${
                  selectedConversation === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <img src={conversation.user.avatar} alt={conversation.user.name} className="w-full h-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  {conversation.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{conversation.user.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <img src={selectedConv.user.avatar} alt={selectedConv.user.name} className="w-full h-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  {selectedConv.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedConv.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConv.user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4" />
                </Button>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
