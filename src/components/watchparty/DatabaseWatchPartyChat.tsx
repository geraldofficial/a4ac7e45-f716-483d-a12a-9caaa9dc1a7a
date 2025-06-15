
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { DatabaseWatchPartyMessage } from '@/services/databaseWatchParty';

interface DatabaseWatchPartyChatProps {
  messages: DatabaseWatchPartyMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const DatabaseWatchPartyChat: React.FC<DatabaseWatchPartyChatProps> = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800/30 backdrop-blur-sm">
      <div className="p-4 md:p-3 border-b border-gray-700/50">
        <h4 className="text-lg md:text-sm text-white font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 md:h-4 md:w-4 text-blue-400" />
          Chat
        </h4>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-3 md:space-y-2 max-h-64 md:max-h-48">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col gap-1 ${
              message.type === 'system' || message.type === 'sync'
                ? 'items-center'
                : 'items-start'
            }`}
          >
            {message.type === 'system' || message.type === 'sync' ? (
              <div className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-full text-sm md:text-xs text-center border border-blue-500/30">
                {message.message}
              </div>
            ) : (
              <div className="bg-gray-700/50 rounded-2xl px-4 py-3 md:px-3 md:py-2 max-w-full border border-gray-600/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm md:text-xs">
                    {message.username}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-gray-200 text-sm md:text-xs leading-relaxed">
                  {message.message}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 md:p-3 border-t border-gray-700/50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 text-sm md:text-xs h-12 md:h-10"
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-3 h-12 md:h-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
