
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, MessageCircle, Share, X, Copy, Check, Plus } from 'lucide-react';
import { watchPartyService, WatchPartySession, WatchPartyMessage } from '@/services/watchParty';
import { useToast } from '@/hooks/use-toast';

interface EnhancedWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
}

export const EnhancedWatchParty: React.FC<EnhancedWatchPartyProps> = ({ 
  movieId, 
  movieTitle, 
  movieType, 
  onClose 
}) => {
  const [session, setSession] = useState<WatchPartySession | null>(null);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      loadMessages();
    }
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
        title: "🎉 Watch party created!",
        description: "Share the party code with friends to watch together.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create watch party.",
        variant: "destructive",
      });
    }
  };

  const joinParty = async (code: string) => {
    try {
      const joinedSession = await watchPartyService.joinSession(code);
      if (joinedSession) {
        setSession(joinedSession);
        toast({
          title: "🎊 Joined watch party!",
          description: `Now watching ${joinedSession.movie_title} with friends.`,
        });
      } else {
        toast({
          title: "Party not found",
          description: "The party code you entered is invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join watch party.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!session || !newMessage.trim()) return;
    
    await watchPartyService.sendMessage(session.id, newMessage);
    setNewMessage('');
    loadMessages();
  };

  const shareParty = async () => {
    if (!session) return;
    
    const shareUrl = `${window.location.origin}/watch-party/${session.id}`;
    const shareText = `Join my watch party for "${movieTitle}"! 🍿\n\nParty Code: ${session.id}\nLink: ${shareUrl}`;
    
    try {
      if (navigator.share) {
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
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Party details copied!",
        description: "Share with friends to join your watch party.",
      });
    }
  };

  const copyPartyCode = async () => {
    if (!session) return;
    await navigator.clipboard.writeText(session.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Party code copied!",
      description: "Share this code with friends.",
    });
  };

  // Initial Party Creation/Join Screen
  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Watch Party</h3>
                <p className="text-sm text-gray-400">{movieTitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={createParty} 
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Watch Party
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900 px-3 text-gray-400">or join existing party</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="Enter party code"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinParty(partyCode)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-12"
              />
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-12"
                onClick={() => joinParty(partyCode)}
                disabled={!partyCode.trim()}
              >
                Join Party
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Active Party Interface
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
      <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">Watch Party</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full">
                    {session.participants.length} watching
                  </span>
                  {isHost && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full">
                      Host
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(!showChat)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={shareParty}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Party Code */}
          <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
            <span className="text-xs text-gray-400 flex-1">Party Code:</span>
            <code className="text-sm font-mono text-white bg-gray-700 px-2 py-1 rounded">
              {session.id}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyPartyCode}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Participants */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">Watching now:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {session.participants.slice(0, 8).map((participant) => (
              <div
                key={participant.user_id}
                className="flex items-center gap-1 bg-gray-800 rounded-full px-2 py-1"
                title={participant.username}
              >
                <span className="text-xs">{participant.avatar}</span>
                <span className="text-xs text-gray-300 max-w-[60px] truncate">
                  {participant.username}
                </span>
              </div>
            ))}
            {session.participants.length > 8 && (
              <div className="bg-gray-800 rounded-full px-2 py-1">
                <span className="text-xs text-gray-400">
                  +{session.participants.length - 8} more
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        {showChat && (
          <div className="border-b border-gray-700">
            <div className="h-32 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-4">
                  No messages yet. Start the conversation! 💬
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="text-xs">
                    <span className="font-medium text-red-400">{message.username}:</span>
                    <span className="ml-2 text-gray-300">{message.message}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="bg-gray-800 border-gray-600 text-white text-xs h-8"
              />
              <Button 
                size="sm" 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
