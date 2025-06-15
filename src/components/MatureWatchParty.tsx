
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { enhancedDatabaseWatchPartyService, EnhancedWatchPartySession, EnhancedWatchPartyMessage, PlaybackSyncData } from '@/services/enhancedDatabaseWatchParty';
import { useToast } from '@/hooks/use-toast';
import { WatchPartySetup } from './watchparty/WatchPartySetup';
import { EnhancedWatchPartyHeader } from './watchparty/EnhancedWatchPartyHeader';
import { EnhancedWatchPartyParticipants } from './watchparty/EnhancedWatchPartyParticipants';
import { EnhancedWatchPartyChat } from './watchparty/EnhancedWatchPartyChat';
import { WatchPartyVideoSync } from './watchparty/WatchPartyVideoSync';
import { WatchPartyInvite } from './watchparty/WatchPartyInvite';
import { WatchPartyControls } from './watchparty/WatchPartyControls';
import { WatchPartyStatus } from './watchparty/WatchPartyStatus';

interface MatureWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
  onPlaybackSync?: (data: PlaybackSyncData) => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
  videoDuration?: number;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
}

export const MatureWatchParty: React.FC<MatureWatchPartyProps> = ({ 
  movieId, 
  movieTitle, 
  movieType, 
  onClose,
  onPlaybackSync,
  currentPlaybackTime = 0,
  isCurrentlyPlaying = false,
  videoDuration = 0,
  volume = 1,
  onVolumeChange,
  onSeek,
  onPlayPause
}) => {
  const [session, setSession] = useState<EnhancedWatchPartySession | null>(null);
  const [messages, setMessages] = useState<EnhancedWatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'invite' | 'controls'>('chat');
  const [isHost, setIsHost] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (session) {
      loadMessages();
      
      // Subscribe to session updates
      const unsubscribeSession = enhancedDatabaseWatchPartyService.subscribeToSession(
        session.id, 
        (updatedSession) => {
          setSession(updatedSession);
          setIsConnected(true);
        }
      );

      // Subscribe to message updates
      const unsubscribeMessages = enhancedDatabaseWatchPartyService.subscribeToMessages(
        session.id,
        (updatedMessages) => {
          setMessages(updatedMessages);
        }
      );

      // Subscribe to playback sync (for non-hosts)
      const unsubscribeSync = enhancedDatabaseWatchPartyService.subscribeToPlaybackSync(
        session.id,
        (syncData) => {
          if (!isHost && onPlaybackSync) {
            const timeSinceLastSync = Date.now() - lastSyncTime;
            if (timeSinceLastSync > 2000) {
              onPlaybackSync(syncData);
              setLastSyncTime(Date.now());
            }
          }
        }
      );

      return () => {
        unsubscribeSession();
        unsubscribeMessages();
        unsubscribeSync();
      };
    }
  }, [session, isHost, onPlaybackSync, lastSyncTime]);

  // Sync host playback to other participants
  useEffect(() => {
    if (session && isHost) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await enhancedDatabaseWatchPartyService.syncPlayback(
            session.id,
            currentPlaybackTime,
            isCurrentlyPlaying
          );
        } catch (error) {
          console.error('Error syncing playback:', error);
          setIsConnected(false);
        }
      }, 1000);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [session, isHost, currentPlaybackTime, isCurrentlyPlaying]);

  useEffect(() => {
    return () => {
      enhancedDatabaseWatchPartyService.cleanup();
    };
  }, []);

  const loadMessages = async () => {
    if (!session) return;
    try {
      const sessionMessages = await enhancedDatabaseWatchPartyService.getMessages(session.id);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsConnected(false);
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
        setIsConnected(true);
        toast({
          title: "Watch party created!",
          description: `Party code: ${sessionId}. You're the host!`,
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
      const sessionExists = await enhancedDatabaseWatchPartyService.sessionExists(cleanCode);
      if (!sessionExists) {
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
        setIsConnected(true);
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
      setIsConnected(false);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const shareParty = async () => {
    if (!session) return;
    
    const shareUrl = `${window.location.origin}/watch-party/${session.id}`;
    const shareText = `🎬 Join my watch party for "${movieTitle}"!\n\n🔑 Party Code: ${session.id}\n🔗 Link: ${shareUrl}`;
    
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

  if (!session) {
    return (
      <WatchPartySetup
        movieTitle={movieTitle}
        partyCode={partyCode}
        setPartyCode={setPartyCode}
        isCreating={isCreating}
        isJoining={isJoining}
        onCreateParty={createParty}
        onJoinParty={joinParty}
        onClose={onClose}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <EnhancedWatchPartyChat
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={sendMessage}
          />
        );
      case 'participants':
        return (
          <div className="p-4">
            <EnhancedWatchPartyParticipants participants={session.participants} />
          </div>
        );
      case 'invite':
        return (
          <div className="p-4">
            <WatchPartyInvite
              sessionId={session.id}
              movieTitle={movieTitle}
              onCopyCode={copyPartyCode}
              copied={copied}
            />
          </div>
        );
      case 'controls':
        return (
          <div className="p-4 space-y-4">
            <WatchPartyControls
              isHost={isHost}
              isPlaying={isCurrentlyPlaying}
              currentTime={currentPlaybackTime}
              duration={videoDuration}
              volume={volume}
              onPlayPause={onPlayPause || (() => {})}
              onSeek={onSeek || (() => {})}
              onVolumeChange={onVolumeChange || (() => {})}
              disabled={!isConnected}
            />
            <WatchPartyVideoSync
              isHost={isHost}
              currentTime={currentPlaybackTime}
              isPlaying={isCurrentlyPlaying}
              onTimeUpdate={(time) => onSeek?.(time)}
              onPlayStateChange={(playing) => onPlayPause?.()}
              syncData={session ? {
                position: session.sync_position,
                isPlaying: session.is_playing,
                timestamp: session.sync_timestamp
              } : undefined}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 md:bg-transparent md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-96 md:max-h-[90vh]">
      <div className="h-full md:h-auto bg-gray-900 md:rounded-2xl md:shadow-2xl border-0 md:border md:border-gray-700 flex flex-col overflow-hidden">
        
        <EnhancedWatchPartyHeader
          session={session}
          isHost={isHost}
          showChat={activeTab === 'chat'}
          copied={copied}
          onToggleChat={() => setActiveTab(activeTab === 'chat' ? 'participants' : 'chat')}
          onShare={shareParty}
          onCopyCode={copyPartyCode}
          onClose={onClose}
        />

        {/* Status Bar */}
        <div className="px-4 py-2 border-b border-gray-700/50">
          <WatchPartyStatus
            participantCount={session.participants.length}
            isPlaying={isCurrentlyPlaying}
            isConnected={isConnected}
            isHost={isHost}
            movieTitle={movieTitle}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700/50 bg-gray-800/30">
          {[
            { id: 'chat', label: 'Chat', icon: '💬' },
            { id: 'participants', label: 'People', icon: '👥' },
            { id: 'invite', label: 'Invite', icon: '📤' },
            { id: 'controls', label: 'Controls', icon: '🎮' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-red-400 bg-red-400/10 border-b-2 border-red-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <span className="block">{tab.icon}</span>
              <span className="hidden sm:block mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>

        {/* Mobile Close Button */}
        <div className="p-4 md:hidden bg-gray-800/30 border-t border-gray-700/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/50 h-12 text-base font-semibold rounded-xl"
          >
            Close Watch Party
          </Button>
        </div>
      </div>
    </div>
  );
};
