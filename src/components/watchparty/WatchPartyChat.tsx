
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, User } from 'lucide-react';
import { WatchPartyMessage } from '@/services/watchParty';

interface WatchPartyChatProps {
  messages: WatchPartyMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const WatchPartyChat: React.FC<WatchPartyChatProps> = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage
}) => {
  return (
    <div className="flex-1 flex flex-col border-b border-gray-700/50 md:border-b-0">
      <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-4 md:space-y-3 max-h-80 md:max-h-40">
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
            <div key={message.id} className="bg-gray-800/30 rounded-xl p-4 md:p-3 border border-gray-600/20 backdrop-blur-sm">
              <div className="flex items-start gap-3 md:gap-2">
                <div className="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-xs flex-shrink-0">
                  <User className="h-4 w-4 md:h-3 md:w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-red-400 text-sm md:text-xs block mb-1">
                    {message.username}
                  </span>
                  <p className="text-gray-200 text-base md:text-xs leading-relaxed break-words">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 md:p-3 bg-gray-800/30 md:bg-transparent border-t border-gray-700/50 md:border-t-0">
        <div className="flex gap-3 md:gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            className="bg-gray-700/50 border-gray-600/50 text-white text-base md:text-sm h-14 md:h-9 rounded-xl backdrop-blur-sm"
          />
          <Button 
            size="sm" 
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-red-600 hover:bg-red-700 text-white h-14 md:h-9 px-6 md:px-4 rounded-xl font-semibold"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
