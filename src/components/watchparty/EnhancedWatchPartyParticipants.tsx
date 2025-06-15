
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EnhancedWatchPartyParticipant } from '@/services/enhancedDatabaseWatchParty';

interface EnhancedWatchPartyParticipantsProps {
  participants: EnhancedWatchPartyParticipant[];
}

export const EnhancedWatchPartyParticipants: React.FC<EnhancedWatchPartyParticipantsProps> = ({
  participants
}) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">
          Participants ({participants.length})
        </h4>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {participants.map((participant) => (
          <div key={participant.user_id} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className="text-xs">
                {participant.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300 flex-1 truncate">
              {participant.username}
            </span>
            {participant.is_active && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
