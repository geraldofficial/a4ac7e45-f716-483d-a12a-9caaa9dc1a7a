
import React from 'react';
import { Users, User, Crown, Circle } from 'lucide-react';
import { EnhancedWatchPartyParticipant } from '@/services/enhancedDatabaseWatchParty';

interface EnhancedWatchPartyParticipantsProps {
  participants: EnhancedWatchPartyParticipant[];
}

export const EnhancedWatchPartyParticipants: React.FC<EnhancedWatchPartyParticipantsProps> = ({ participants }) => {
  const activeParticipants = participants.filter(p => p.is_active);
  const hostParticipant = participants.find(p => p.user_id === participants[0]?.user_id);

  return (
    <div className="p-4 md:p-3 border-b border-gray-700/50">
      <h4 className="text-lg md:text-sm text-white mb-3 md:mb-2 font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 md:h-4 md:w-4 text-red-400" />
        Watching now ({activeParticipants.length})
      </h4>
      <div className="grid grid-cols-1 md:flex md:flex-wrap gap-3 md:gap-2 max-h-32 overflow-y-auto">
        {activeParticipants.slice(0, 8).map((participant, index) => {
          const isHost = index === 0; // First participant is usually the host
          const isOnline = new Date(participant.last_seen).getTime() > Date.now() - 30000; // Online if seen in last 30 seconds
          
          return (
            <div
              key={participant.id}
              className="flex items-center gap-3 md:gap-2 bg-gray-800/50 rounded-xl md:rounded-full px-4 py-3 md:px-3 md:py-2 border border-gray-600/30 backdrop-blur-sm relative"
              title={`${participant.username}${isHost ? ' (Host)' : ''}`}
            >
              <div className="relative">
                <div className="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-xs">
                  {isHost ? <Crown className="h-4 w-4 md:h-3 md:w-3 text-yellow-400" /> : <User className="h-4 w-4 md:h-3 md:w-3" />}
                </div>
                <Circle 
                  className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${
                    isOnline ? 'text-green-400 fill-green-400' : 'text-gray-500 fill-gray-500'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm md:text-xs text-gray-200 truncate font-medium block">
                  {participant.username}
                </span>
                {isHost && (
                  <span className="text-xs text-yellow-400 font-medium">Host</span>
                )}
              </div>
            </div>
          );
        })}
        
        {activeParticipants.length > 8 && (
          <div className="bg-gray-800/50 rounded-xl md:rounded-full px-4 py-3 md:px-3 md:py-2 flex items-center justify-center border border-gray-600/30">
            <span className="text-sm md:text-xs text-gray-400 font-semibold">
              +{activeParticipants.length - 8} more
            </span>
          </div>
        )}
        
        {activeParticipants.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No active participants</p>
          </div>
        )}
      </div>
    </div>
  );
};
