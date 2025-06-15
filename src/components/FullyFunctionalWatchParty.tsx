
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { enhancedDatabaseWatchPartyService, EnhancedWatchPartySession, EnhancedWatchPartyMessage, PlaybackSyncData } from '@/services/enhancedDatabaseWatchParty';
import { useToast } from '@/hooks/use-toast';
import { WatchPartySetup } from './watchparty/WatchPartySetup';
import { EnhancedWatchPartyHeader } from './watchparty/EnhancedWatchPartyHeader';
import { EnhancedWatchPartyParticipants } from './watchparty/EnhancedWatchPartyParticipants';
import { EnhancedWatchPartyChat } from './watchparty/EnhancedWatchPartyChat';

interface FullyFunctionalWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
  onPlaybackSync?: (data: PlaybackSyncData) => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
}

export const FullyFunctionalWatchParty: React.FC<FullyFunctionalWatchPartyProps> = ({ 
  movieId, 
  movieTitle, 
  movieType, 
  onClose,
  onPlaybackSync,
  currentPlaybackTime = 0,
  isCurrentlyPlaying = false
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
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const { toast } = useToast();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (session) {
      loadMessages();
      
      const unsubscribeSession = enhancedDatabaseWatchPartyService.subscribeToSession(
        session.id, 
        (updatedSession) => {
          setSession(updatedSession);
        }
      );

      const unsubscribeMessages = enhancedDatabaseWatchPartyService.subscribeToMessages(
        session.id,
        (updatedMessages) => {
          setMessages(updatedMessages);
        }
      );

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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 md:bg-transparent md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-96 md:max-h-[85vh]">
      <div className="h-full md:h-auto bg-gray-900 md:rounded-2xl md:shadow-2xl border-0 md:border md:border-gray-700 flex flex-col overflow-hidden">
        
        <EnhancedWatchPartyHeader
          session={session}
          isHost={isHost}
          showChat={showChat}
          copied={copied}
          onToggleChat={() => setShowChat(!showChat)}
          onShare={shareParty}
          onCopyCode={copyPartyCode}
          onClose={onClose}
        />

        <EnhancedWatchPartyParticipants participants={session.participants} />

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
