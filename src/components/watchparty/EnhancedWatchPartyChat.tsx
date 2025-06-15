
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-2">
            {message.type !== 'system' && (
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {message.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={`flex-1 ${message.type === 'system' ? 'text-center' : ''}`}>
              {message.type === 'system' ? (
                <p className="text-xs text-gray-400 italic">{message.message}</p>
              ) : (
                <>
                  <p className="text-xs text-gray-400">{message.username}</p>
                  <p className="text-sm text-gray-200">{message.message}</p>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
