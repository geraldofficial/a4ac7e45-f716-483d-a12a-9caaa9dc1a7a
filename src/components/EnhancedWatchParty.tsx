
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, MessageCircle, Share, X, Copy, Check, Plus, Link, Twitter, Facebook } from 'lucide-react';
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
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      loadMessages();
    }
  }, [session]);

  const loadMessages = async () => {
    if (!session) return;
    try {
      const sessionMessages = await watchPartyService.getMessages(session.id);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createParty = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const sessionId = await watchPartyService.createSession(movieId, movieTitle, movieType);
      const newSession = await watchPartyService.joinSession(sessionId);
      
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
    try {
      // Check if session exists first
      if (!watchPartyService.sessionExists(code)) {
        toast({
          title: "Party not found",
          description: "The party code you entered is invalid or expired.",
          variant: "destructive",
        });
        return;
      }

      const joinedSession = await watchPartyService.joinSession(code);
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
      await watchPartyService.sendMessage(session.id, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
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

  // Initial Party Creation/Join Screen
  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
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
              disabled={isCreating}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
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
                <span className="bg-gray-900 px-3 text-gray-400">or join existing party</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="Enter party code (e.g. ABC123)"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && joinParty(partyCode)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-12 text-base text-center"
                maxLength={8}
              />
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-12 text-base"
                onClick={() => joinParty(partyCode)}
                disabled={!partyCode.trim() || isJoining}
              >
                {isJoining ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    Joining...
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
  }

  // Active Party Interface - Mobile First Design
  return (
    <div className="fixed inset-0 z-50 bg-black/95 md:bg-transparent md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-96 md:max-h-[80vh]">
      <div className="h-full md:h-auto bg-gray-900 md:rounded-xl md:shadow-2xl border-0 md:border md:border-gray-700 flex flex-col">
        
        {/* Enhanced Mobile Header */}
        <div className="p-4 md:p-4 border-b border-gray-700 bg-gradient-to-r from-red-900/20 to-gray-800 md:rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl md:rounded-full flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-base font-bold text-white">Watch Party</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm md:text-xs bg-green-500/20 text-green-400 px-3 py-1 md:px-2 rounded-full font-semibold border border-green-500/30">
                    {session.participants.length} watching
                  </span>
                  {isHost && (
                    <span className="text-sm md:text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 md:px-2 rounded-full font-semibold border border-yellow-500/30">
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
                className={`text-gray-300 hover:text-white hover:bg-white/10 h-12 w-12 md:h-8 md:w-8 p-0 rounded-xl md:rounded-full transition-all ${showChat ? 'bg-white/10 text-white' : ''}`}
              >
                <MessageCircle className="h-6 w-6 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={shareParty}
                className="text-gray-300 hover:text-white hover:bg-white/10 h-12 w-12 md:h-8 md:w-8 p-0 rounded-xl md:rounded-full transition-all"
              >
                <Share className="h-6 w-6 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-300 hover:text-white hover:bg-white/10 h-12 w-12 md:h-8 md:w-8 p-0 rounded-xl md:rounded-full transition-all"
              >
                <X className="h-6 w-6 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Party Code Section */}
          <div className="bg-gray-800/50 rounded-xl p-4 md:p-3 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="h-4 w-4 text-gray-400" />
                  <span className="text-sm md:text-xs text-gray-400 font-medium">Party Code</span>
                </div>
                <code className="text-2xl md:text-lg font-mono font-bold text-white bg-gray-700/50 px-4 py-3 md:px-3 md:py-2 rounded-lg block border border-gray-600/30 tracking-wider">
                  {session.id}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPartyCode}
                className="text-gray-300 hover:text-white hover:bg-gray-600/50 h-14 w-14 md:h-10 md:w-10 p-0 ml-4 rounded-xl transition-all"
              >
                {copied ? <Check className="h-6 w-6 md:h-5 md:w-5 text-green-400" /> : <Copy className="h-6 w-6 md:h-5 md:w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Participants Section */}
        <div className="p-4 md:p-3 border-b border-gray-700/50">
          <h4 className="text-lg md:text-sm text-white mb-3 md:mb-2 font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 md:h-4 md:w-4 text-red-400" />
            Watching now
          </h4>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-2">
            {session.participants.slice(0, 6).map((participant) => (
              <div
                key={participant.user_id}
                className="flex items-center gap-3 md:gap-2 bg-gray-800/50 rounded-xl md:rounded-full px-4 py-3 md:px-3 md:py-2 border border-gray-600/30 backdrop-blur-sm"
                title={participant.username}
              >
                <div className="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-xs">
                  {participant.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm md:text-xs text-gray-200 truncate font-medium">
                  {participant.username}
                </span>
              </div>
            ))}
            {session.participants.length > 6 && (
              <div className="bg-gray-800/50 rounded-xl md:rounded-full px-4 py-3 md:px-3 md:py-2 flex items-center justify-center border border-gray-600/30">
                <span className="text-sm md:text-xs text-gray-400 font-semibold">
                  +{session.participants.length - 6} more
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Chat Section */}
        {showChat && (
          <div className="flex-1 flex flex-col border-b border-gray-700/50 md:border-b-0">
            <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-4 md:space-y-3 max-h-80 md:max-h-40">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12 md:py-6">
                  <MessageCircle className="h-16 w-16 md:h-10 md:w-10 text-gray-600 mx-auto mb-4 md:mb-3" />
                  <p className="text-lg md:text-sm font-semibold text-gray-400">No messages yet</p>
                  <p className="text-sm md:text-xs text-gray-600 mt-2 md:mt-1">
                    Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="bg-gray-800/30 rounded-xl p-4 md:p-3 border border-gray-600/20 backdrop-blur-sm">
                    <div className="flex items-start gap-3 md:gap-2">
                      <div className="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-xs flex-shrink-0">
                        {message.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-red-400 text-sm md:text-xs block mb-1">
                          {message.username}
                        </span>
                        <p className="text-gray-200 text-base md:text-xs leading-relaxed break-words">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Enhanced Chat Input */}
            <div className="p-4 md:p-3 bg-gray-800/30 md:bg-transparent border-t border-gray-700/50 md:border-t-0">
              <div className="flex gap-3 md:gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-base md:text-sm h-14 md:h-9 rounded-xl backdrop-blur-sm"
                />
                <Button 
                  size="sm" 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white h-14 md:h-9 px-6 md:px-4 rounded-xl font-semibold"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Mobile Footer */}
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
