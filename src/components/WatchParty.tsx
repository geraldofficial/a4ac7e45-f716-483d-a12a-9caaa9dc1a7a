
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, MessageCircle, Share, X } from 'lucide-react';
import { watchPartyService, WatchPartySession, WatchPartyMessage } from '@/services/watchParty';
import { useToast } from '@/hooks/use-toast';

interface WatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
}

export const WatchParty: React.FC<WatchPartyProps> = ({ movieId, movieTitle, movieType, onClose }) => {
  const [session, setSession] = useState<WatchPartySession | null>(null);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, [session]);

  const loadMessages = async () => {
    if (!session) return;
    const sessionMessages = await watchPartyService.getMessages(session.id);
    setMessages(sessionMessages);
  };

  const createParty = async () => {
    try {
      const sessionId = await watchPartyService.createSession(movieId, movieTitle, movieType);
      const newSession = await watchPartyService.joinSession(sessionId);
      setSession(newSession);
      setIsHost(true);
      
      toast({
        title: "Watch party created!",
        description: "Share the party code with friends to watch together."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create watch party.",
        variant: "destructive"
      });
    }
  };

  const joinParty = async (partyCode: string) => {
    try {
      const joinedSession = await watchPartyService.joinSession(partyCode);
      if (joinedSession) {
        setSession(joinedSession);
        toast({
          title: "Joined watch party!",
          description: `Now watching ${joinedSession.movie_title} with friends.`
        });
      } else {
        toast({
          title: "Party not found",
          description: "The party code you entered is invalid.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join watch party.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!session || !newMessage.trim()) return;
    
    await watchPartyService.sendMessage(session.id, newMessage);
    setNewMessage('');
    loadMessages();
  };

  const shareParty = () => {
    if (!session) return;
    
    const shareUrl = `${window.location.origin}/watch-party/${session.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Party link copied!",
      description: "Share this link with friends to join your watch party."
    });
  };

  if (!session) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Watch Party
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <Button onClick={createParty} className="w-full">
            Create Watch Party
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">or</div>
          
          <div className="space-y-2">
            <Input
              placeholder="Enter party code"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  joinParty(e.currentTarget.value);
                }
              }}
            />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                if (input?.value) joinParty(input.value);
              }}
            >
              Join Party
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 w-80 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Watch Party</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {session.participants.length}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={shareParty}>
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Participants */}
        <div className="flex gap-2 mb-3">
          {session.participants.slice(0, 6).map((participant) => (
            <div
              key={participant.user_id}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs"
              title={participant.username}
            >
              {participant.avatar}
            </div>
          ))}
          {session.participants.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
              +{session.participants.length - 6}
            </div>
          )}
        </div>

        {/* Chat */}
        {showChat && (
          <div className="border-t pt-3">
            <div className="h-32 overflow-y-auto mb-2 space-y-1">
              {messages.map((message) => (
                <div key={message.id} className="text-xs">
                  <span className="font-medium text-primary">{message.username}:</span>
                  <span className="ml-1">{message.message}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="text-xs"
              />
              <Button size="sm" onClick={sendMessage}>
                Send
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
