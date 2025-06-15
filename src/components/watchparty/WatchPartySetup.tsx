
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, X, Plus } from 'lucide-react';

interface WatchPartySetupProps {
  movieTitle: string;
  partyCode: string;
  setPartyCode: (code: string) => void;
  isCreating: boolean;
  isJoining: boolean;
  onCreateParty: () => void;
  onJoinParty: (code: string) => void;
  onClose: () => void;
}

export const WatchPartySetup: React.FC<WatchPartySetupProps> = ({
  movieTitle,
  partyCode,
  setPartyCode,
  isCreating,
  isJoining,
  onCreateParty,
  onJoinParty,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Watch Party</h3>
              <p className="text-sm text-gray-400 truncate max-w-48">{movieTitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-6">
          <Button 
            onClick={onCreateParty}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-14 text-base font-semibold rounded-xl shadow-lg"
          >
            {isCreating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Party...
              </div>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Create New Watch Party
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-900 px-4 text-gray-400 font-medium">or join existing party</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              placeholder="Enter party code (e.g. ABC123)"
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && onJoinParty(partyCode)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-14 text-base text-center font-mono tracking-wider rounded-xl"
              maxLength={6}
            />
            <Button 
              variant="outline" 
              className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-14 text-base font-semibold rounded-xl"
              onClick={() => onJoinParty(partyCode)}
              disabled={!partyCode.trim() || isJoining}
            >
              {isJoining ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Joining Party...
                </div>
              ) : (
                'Join Party'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
