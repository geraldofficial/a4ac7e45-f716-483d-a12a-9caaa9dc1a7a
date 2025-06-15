
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, User, Crown, Bot } from 'lucide-react';
import { EnhancedWatchPartyMessage } from '@/services/enhancedDatabaseWatchParty';

interface EnhancedWatchPartyChatProps {
  messages: EnhancedWatchPartyMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const EnhancedWatchPartyChat: React.FC<EnhancedWatchPartyChatProps> = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageIcon = (message: EnhancedWatchPartyMessage) => {
    if (message.type === 'system' || message.type === 'sync') {
      return <Bot className="h-4 w-4 md:h-3 md:w-3 text-blue-400" />;
    }
    return <User className="h-4 w-4 md:h-3 md:w-3" />;
  };

  const getMessageBgColor = (message: EnhancedWatchPartyMessage) => {
    switch (message.type) {
      case 'system':
        return 'bg-blue-800/30 border-blue-600/20';
      case 'sync':
        return 'bg-green-800/30 border-green-600/20';
      default:
        return 'bg-gray-800/30 border-gray-600/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 flex flex-col border-b border-gray-700/50 md:border-b-0">
      <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-3 md:space-y-2 max-h-80 md:max-h-48">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12 md:py-6">
            <MessageCircle className="h-16 w-16 md:h-10 md:w-10 text-gray-600 mx-auto mb-4 md:mb-3" />
            <p className="text-lg md:text-sm font-semibold text-gray-400">No messages yet</p>
            <p className="text-sm md:text-xs text-gray-600 mt-2 md:mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`rounded-xl p-3 md:p-2 border backdrop-blur-sm ${getMessageBgColor(message)}`}
            >
              <div className="flex items-start gap-2 md:gap-1">
                <div className="w-7 h-7 md:w-5 md:h-5 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-xs flex-shrink-0 mt-1">
                  {getMessageIcon(message)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-red-400 text-sm md:text-xs">
                      {message.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.type === 'sync' && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                        sync
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm md:text-xs leading-relaxed break-words">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 md:p-3 bg-gray-800/30 md:bg-transparent border-t border-gray-700/50 md:border-t-0">
        <div className="flex gap-3 md:gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            className="bg-gray-700/50 border-gray-600/50 text-white text-sm md:text-xs h-12 md:h-8 rounded-xl backdrop-blur-sm placeholder-gray-400"
            maxLength={500}
          />
          <Button 
            size="sm" 
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-red-600 hover:bg-red-700 text-white h-12 md:h-8 px-4 md:px-3 rounded-xl font-semibold"
          >
            <Send className="h-4 w-4 md:h-3 md:w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
