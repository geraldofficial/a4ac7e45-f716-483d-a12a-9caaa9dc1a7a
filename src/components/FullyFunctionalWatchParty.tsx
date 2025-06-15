
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enhancedDatabaseWatchPartyService, EnhancedWatchPartySession, EnhancedWatchPartyMessage } from '@/services/enhancedDatabaseWatchParty';
import { useToast } from '@/hooks/use-toast';
import { EnhancedWatchPartyHeader } from './watchparty/EnhancedWatchPartyHeader';
import { EnhancedWatchPartyParticipants } from './watchparty/EnhancedWatchPartyParticipants';
import { EnhancedWatchPartyChat } from './watchparty/EnhancedWatchPartyChat';
import { WatchPartyVideoSync } from './watchparty/WatchPartyVideoSync';
import { WatchPartyControls } from './watchparty/WatchPartyControls';
import { X, Users, Play } from 'lucide-react';

interface FullyFunctionalWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
  videoDuration?: number;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
  onPlaybackSync?: (data: { position: number; isPlaying: boolean; timestamp: string }) => void;
}

export const FullyFunctionalWatchParty: React.FC<FullyFunctionalWatchPartyProps> = ({ 
  movieId, 
  movieTitle, 
  movieType, 
  onClose,
  currentPlaybackTime = 0,
  isCurrentlyPlaying = false,
  videoDuration = 0,
  volume = 1,
  onVolumeChange,
  onSeek,
  onPlayPause,
  onPlaybackSync
}) => {
  const [session, setSession] = useState<EnhancedWatchPartySession | null>(null);
  const [messages, setMessages] = useState<EnhancedWatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [setupMode, setSetupMode] = useState(true);
  const { toast } = useToast();
  
  const unsubscribeSessionRef = useRef<(() => void) | null>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);
  const unsubscribeSyncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup subscriptions on unmount
      if (unsubscribeSessionRef.current) unsubscribeSessionRef.current();
      if (unsubscribeMessagesRef.current) unsubscribeMessagesRef.current();
      if (unsubscribeSyncRef.current) unsubscribeSyncRef.current();
      enhancedDatabaseWatchPartyService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (session) {
      loadMessages();
      
      // Subscribe to real-time updates
      unsubscribeSessionRef.current = enhancedDatabaseWatchPartyService.subscribeToSession(
        session.id,
        (updatedSession) => setSession(updatedSession)
      );
      
      unsubscribeMessagesRef.current = enhancedDatabaseWatchPartyService.subscribeToMessages(
        session.id,
        setMessages
      );
      
      unsubscribeSyncRef.current = enhancedDatabaseWatchPartyService.subscribeToPlaybackSync(
        session.id,
        (syncData) => {
          if (!isHost && onPlaybackSync) {
            onPlaybackSync(syncData);
          }
        }
      );
    }
  }, [session, isHost, onPlaybackSync]);

  const loadMessages = async () => {
    if (!session) return;
    try {
      const sessionMessages = await enhancedDatabaseWatchPartyService.getMessages(session.id);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createParty = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const sessionId = await enhancedDatabaseWatchPartyService.createSession(movieId, movieTitle, movieType);
      const newSession = await enhancedDatabaseWatchPartyService.joinSession(sessionId);
      
      if (newSession) {
        setSession(newSession);
        setIsHost(true);
        setSetupMode(false);
        toast({
          title: "Watch party created!",
          description: `Party code: ${sessionId}`,
        });
      }
    } catch (error) {
      console.error('Error creating party:', error);
      toast({
        title: "Error",
        description: "Failed to create watch party.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinParty = async (code: string) => {
    if (isJoining || !code.trim()) return;
    
    setIsJoining(true);
    const cleanCode = code.trim().toUpperCase();
    
    try {
      const exists = await enhancedDatabaseWatchPartyService.sessionExists(cleanCode);
      if (!exists) {
        toast({
          title: "Party not found",
          description: "The party code you entered is invalid or expired.",
          variant: "destructive",
        });
        return;
      }

      const joinedSession = await enhancedDatabaseWatchPartyService.joinSession(cleanCode);
      if (joinedSession) {
        setSession(joinedSession);
        setIsHost(false);
        setSetupMode(false);
        toast({
          title: "Joined watch party!",
          description: `Now watching ${joinedSession.movie_title} with friends.`,
        });
      }
    } catch (error) {
      console.error('Error joining party:', error);
      toast({
        title: "Error",
        description: "Failed to join watch party.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const sendMessage = async () => {
    if (!session || !newMessage.trim()) return;
    
    try {
      await enhancedDatabaseWatchPartyService.sendMessage(session.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const handlePlaybackSync = async (position: number, isPlaying: boolean) => {
    if (!session || !isHost) return;
    
    try {
      await enhancedDatabaseWatchPartyService.syncPlayback(session.id, position, isPlaying);
    } catch (error) {
      console.error('Error syncing playback:', error);
    }
  };

  const shareParty = async () => {
    if (!session) return;
    
    const shareUrl = `${window.location.origin}/watch-party/${session.id}`;
    const shareText = `Join my watch party for "${movieTitle}"!\n\nParty Code: ${session.id}\nLink: ${shareUrl}`;
    
    try {
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `Watch Party: ${movieTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Party details copied!",
          description: "Share the link with friends to join your watch party.",
        });
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Party details copied!",
          description: "Share with friends to join your watch party.",
        });
      } catch (clipboardError) {
        toast({
          title: "Unable to share",
          description: "Please manually share the party code with friends.",
        });
      }
    }
  };

  const copyPartyCode = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Party code copied!",
        description: "Share this code with friends.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Setup mode - create or join party
  if (setupMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 md:bg-transparent md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-96 md:max-h-[85vh]">
        <div className="h-full md:h-auto bg-gray-900 md:rounded-2xl md:shadow-2xl border-0 md:border md:border-gray-700 flex flex-col overflow-hidden">
          
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-red-900/30 to-gray-800 md:rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Watch Party</h3>
                  <p className="text-sm text-gray-300">{movieTitle}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-300 hover:text-white hover:bg-white/10 h-10 w-10 p-0 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {/* Create Party */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Host a Watch Party</h4>
              <p className="text-sm text-gray-400">Start a new watch party and invite friends</p>
              <Button 
                onClick={createParty}
                disabled={isCreating}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                {isCreating ? 'Creating...' : 'Create Party'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900 px-4 text-gray-400">or</span>
              </div>
            </div>

            {/* Join Party */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Join a Watch Party</h4>
              <p className="text-sm text-gray-400">Enter a party code to join friends</p>
              <div className="space-y-3">
                <Input
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                  placeholder="Enter party code..."
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-12 text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
                <Button 
                  onClick={() => joinParty(partyCode)}
                  disabled={isJoining || !partyCode.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold"
                >
                  {isJoining ? 'Joining...' : 'Join Party'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active watch party
  return (
    <div className="fixed inset-0 z-50 bg-black/95 md:bg-transparent md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-96 md:max-h-[85vh]">
      <div className="h-full md:h-auto bg-gray-900 md:rounded-2xl md:shadow-2xl border-0 md:border md:border-gray-700 flex flex-col overflow-hidden">
        
        <EnhancedWatchPartyHeader
          session={session!}
          isHost={isHost}
          showChat={showChat}
          copied={copied}
          onToggleChat={() => setShowChat(!showChat)}
          onShare={shareParty}
          onCopyCode={copyPartyCode}
          onClose={onClose}
        />

        <EnhancedWatchPartyParticipants participants={session?.participants || []} />

        {/* Video Sync Component */}
        <WatchPartyVideoSync
          isHost={isHost}
          currentTime={currentPlaybackTime}
          isPlaying={isCurrentlyPlaying}
          onTimeUpdate={(time) => handlePlaybackSync(time, isCurrentlyPlaying)}
          onPlayStateChange={(playing) => handlePlaybackSync(currentPlaybackTime, playing)}
        />

        {/* Host Controls */}
        {isHost && onSeek && onPlayPause && onVolumeChange && (
          <div className="p-4 border-b border-gray-700">
            <WatchPartyControls
              isHost={isHost}
              isPlaying={isCurrentlyPlaying}
              currentTime={currentPlaybackTime}
              duration={videoDuration}
              volume={volume}
              onPlayPause={onPlayPause}
              onSeek={onSeek}
              onVolumeChange={onVolumeChange}
            />
          </div>
        )}

        {showChat && (
          <EnhancedWatchPartyChat
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={sendMessage}
          />
        )}

        {!showChat && (
          <div className="p-4 md:hidden bg-gray-800/30">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/50 h-14 text-base font-semibold rounded-xl"
            >
              Close Watch Party
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
