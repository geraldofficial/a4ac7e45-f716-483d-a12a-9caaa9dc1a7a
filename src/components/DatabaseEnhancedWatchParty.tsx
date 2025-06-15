
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { databaseWatchPartyService, DatabaseWatchPartySession, DatabaseWatchPartyMessage } from '@/services/databaseWatchParty';
import { useToast } from '@/hooks/use-toast';
import { WatchPartySetup } from './watchparty/WatchPartySetup';
import { WatchPartyHeader } from './watchparty/WatchPartyHeader';
import { DatabaseWatchPartyParticipants } from './watchparty/DatabaseWatchPartyParticipants';
import { DatabaseWatchPartyChat } from './watchparty/DatabaseWatchPartyChat';

interface DatabaseEnhancedWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
}

export const DatabaseEnhancedWatchParty: React.FC<DatabaseEnhancedWatchPartyProps> = ({ 
  movieId, 
  movieTitle, 
  movieType, 
  onClose 
}) => {
  const [session, setSession] = useState<DatabaseWatchPartySession | null>(null);
  const [messages, setMessages] = useState<DatabaseWatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      // Load initial messages
      loadMessages();
      
      // Subscribe to session updates
      const unsubscribeSession = databaseWatchPartyService.subscribeToSession(
        session.id, 
        (updatedSession) => {
          setSession(updatedSession);
        }
      );

      // Subscribe to message updates
      const unsubscribeMessages = databaseWatchPartyService.subscribeToMessages(
        session.id,
        (updatedMessages) => {
          setMessages(updatedMessages);
        }
      );

      return () => {
        unsubscribeSession();
        unsubscribeMessages();
      };
    }
  }, [session]);

  useEffect(() => {
    return () => {
      databaseWatchPartyService.cleanup();
    };
  }, []);

  const loadMessages = async () => {
    if (!session) return;
    try {
      const sessionMessages = await databaseWatchPartyService.getMessages(session.id);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createParty = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const sessionId = await databaseWatchPartyService.createSession(movieId, movieTitle, movieType);
      const newSession = await databaseWatchPartyService.joinSession(sessionId);
      
      if (newSession) {
        setSession(newSession);
        setIsHost(true);
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
      const sessionExists = await databaseWatchPartyService.sessionExists(cleanCode);
      if (!sessionExists) {
        toast({
          title: "Party not found",
          description: "The party code you entered is invalid or expired.",
          variant: "destructive",
        });
        return;
      }

      const joinedSession = await databaseWatchPartyService.joinSession(cleanCode);
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
      await databaseWatchPartyService.sendMessage(session.id, newMessage);
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
        
        <WatchPartyHeader
          session={session}
          isHost={isHost}
          showChat={showChat}
          copied={copied}
          onToggleChat={() => setShowChat(!showChat)}
          onShare={shareParty}
          onCopyCode={copyPartyCode}
          onClose={onClose}
        />

        <DatabaseWatchPartyParticipants participants={session.participants} />

        {showChat && (
          <DatabaseWatchPartyChat
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
