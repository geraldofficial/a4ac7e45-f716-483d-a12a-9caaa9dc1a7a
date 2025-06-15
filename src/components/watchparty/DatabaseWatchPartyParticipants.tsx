
import React from 'react';
import { Users, User } from 'lucide-react';
import { DatabaseWatchPartyParticipant } from '@/services/databaseWatchParty';

interface DatabaseWatchPartyParticipantsProps {
  participants: DatabaseWatchPartyParticipant[];
}

export const DatabaseWatchPartyParticipants: React.FC<DatabaseWatchPartyParticipantsProps> = ({ participants }) => {
  return (
    <div className="p-4 md:p-3 border-b border-gray-700/50">
      <h4 className="text-lg md:text-sm text-white mb-3 md:mb-2 font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 md:h-4 md:w-4 text-red-400" />
        Watching now
      </h4>
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-2">
        {participants.slice(0, 6).map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 md:gap-2 bg-gray-800/50 rounded-xl md:rounded-full px-4 py-3 md:px-3 md:py-2 border border-gray-600/30 backdrop-blur-sm"
            title={participant.username}
          >
            <div className="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-xs">
              <User className="h-4 w-4 md:h-3 md:w-3" />
            </div>
            <span className="text-sm md:text-xs text-gray-200 truncate font-medium">
              {participant.username}
            </span>
          </div>
        ))}
        {participants.length > 6 && (
          <div className="bg-gray-800/50 rounded-xl md:rounded-full px-4 py-3 md:px-3 md:py-2 flex items-center justify-center border border-gray-600/30">
            <span className="text-sm md:text-xs text-gray-400 font-semibold">
              +{participants.length - 6} more
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
