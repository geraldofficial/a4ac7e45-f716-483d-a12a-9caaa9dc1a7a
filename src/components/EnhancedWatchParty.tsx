
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

  // Mobile-First Active Party Interface
  return (
    <div className="fixed inset-0 z-50 bg-black/90 md:bg-transparent md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-96">
      <div className="h-full md:h-auto bg-gray-900 md:rounded-lg md:shadow-2xl border-0 md:border md:border-gray-700 flex flex-col">
        
        {/* Mobile Header with Watch Party Info */}
        <div className="p-4 md:p-4 border-b border-gray-700 bg-gray-800 md:bg-gray-900 md:rounded-t-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-base font-semibold text-white">Watch Party</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm md:text-xs bg-green-600/20 text-green-400 px-3 py-1 md:px-2 rounded-full font-medium">
                    {session.participants.length} watching
                  </span>
                  {isHost && (
                    <span className="text-sm md:text-xs bg-yellow-600/20 text-yellow-400 px-3 py-1 md:px-2 rounded-full font-medium">
                      Host
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(!showChat)}
                className={`text-gray-300 hover:text-white hover:bg-white/10 h-10 w-10 p-0 md:h-8 md:w-8 ${showChat ? 'bg-white/10' : ''}`}
              >
                <MessageCircle className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={shareParty}
                className="text-gray-300 hover:text-white hover:bg-white/10 h-10 w-10 p-0 md:h-8 md:w-8"
              >
                <Share className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-300 hover:text-white hover:bg-white/10 h-10 w-10 p-0 md:h-8 md:w-8"
              >
                <X className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile-Optimized Party Code */}
          <div className="bg-gray-700 rounded-lg p-3 md:p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm md:text-xs text-gray-400 block mb-1">Party Code</span>
                <code className="text-lg md:text-sm font-mono text-white bg-gray-600 px-3 py-2 md:px-2 md:py-1 rounded block">
                  {session.id}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPartyCode}
                className="text-gray-300 hover:text-white hover:bg-gray-600 h-12 w-12 md:h-8 md:w-8 p-0 ml-3"
              >
                {copied ? <Check className="h-5 w-5 md:h-4 md:w-4" /> : <Copy className="h-5 w-5 md:h-4 md:w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Participants */}
        <div className="p-4 md:p-3 border-b border-gray-700 bg-gray-850 md:bg-transparent">
          <h4 className="text-base md:text-sm text-gray-300 mb-3 md:mb-2 font-medium">Watching now</h4>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
            {session.participants.slice(0, 6).map((participant) => (
              <div
                key={participant.user_id}
                className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2 md:px-2 md:py-1 md:rounded-full"
                title={participant.username}
              >
                <span className="text-lg md:text-sm">{participant.avatar}</span>
                <span className="text-sm md:text-xs text-gray-200 truncate font-medium">
                  {participant.username}
                </span>
              </div>
            ))}
            {session.participants.length > 6 && (
              <div className="bg-gray-700 rounded-lg px-3 py-2 md:px-2 md:py-1 md:rounded-full flex items-center justify-center">
                <span className="text-sm md:text-xs text-gray-400 font-medium">
                  +{session.participants.length - 6}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-Optimized Chat */}
        {showChat && (
          <div className="flex-1 flex flex-col border-b border-gray-700 md:border-b-0">
            <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-3 md:space-y-2 max-h-64 md:max-h-32">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 md:py-4">
                  <MessageCircle className="h-12 w-12 md:h-8 md:w-8 text-gray-600 mx-auto mb-3 md:mb-2" />
                  <p className="text-base md:text-sm font-medium">No messages yet</p>
                  <p className="text-sm md:text-xs text-gray-600 mt-1">
                    Start the conversation! 💬
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="bg-gray-800 rounded-lg p-3 md:p-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg md:text-sm">👤</span>
                      <div className="flex-1">
                        <span className="font-medium text-red-400 text-sm md:text-xs">
                          {message.username}
                        </span>
                        <p className="text-gray-200 text-sm md:text-xs mt-1 leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Mobile Chat Input */}
            <div className="p-4 md:p-3 bg-gray-800 md:bg-transparent">
              <div className="flex gap-3 md:gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="bg-gray-700 border-gray-600 text-white text-base md:text-sm h-12 md:h-8 rounded-lg"
                />
                <Button 
                  size="sm" 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white h-12 md:h-8 px-6 md:px-3 rounded-lg"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Close Button (if chat is not shown) */}
        {!showChat && (
          <div className="p-4 md:hidden">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-12"
            >
              Close Watch Party
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
