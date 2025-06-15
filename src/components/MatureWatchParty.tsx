
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { WatchPartyErrorBoundary } from './watchparty/WatchPartyErrorBoundary';
import { WatchPartyVideoSync } from './watchparty/WatchPartyVideoSync';
import { WatchPartyStatusCard } from './watchparty/WatchPartyStatusCard';
import { WatchPartyInvite } from './watchparty/WatchPartyInvite';
import { WatchPartyControls } from './watchparty/WatchPartyControls';
import { SimpleVideoPlayer } from './SimpleVideoPlayer';
import { X, Users, Settings, MessageCircle, Play, Pause } from 'lucide-react';

interface WatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
  onPlaybackSync?: (data: { position: number; isPlaying: boolean; timestamp: string }) => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
  videoDuration?: number;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
}

export const MatureWatchParty: React.FC<WatchPartyProps> = ({
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
  const [isHost, setIsHost] = useState(true);
  const [participants, setParticipants] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('party');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate room code
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  }, []);

  const handleStartWatching = () => {
    setShowVideo(true);
    setIsVideoPlaying(true);
    toast({
      title: "Watch party started!",
      description: "You're now watching together",
    });
  };

  const handlePlayPause = () => {
    setIsVideoPlaying(!isVideoPlaying);
    onPlayPause?.();
  };

  const handleSyncReceived = (data: any) => {
    console.log('Sync received:', data);
    // Handle video sync here
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
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

  if (showVideo) {
    return (
      <WatchPartyErrorBoundary onReset={() => setShowVideo(false)}>
        <div className="fixed inset-0 z-50 bg-black">
          <SimpleVideoPlayer
            title={movieTitle}
            tmdbId={movieId}
            type={movieType}
            onClose={() => setShowVideo(false)}
          />
          
          {/* Watch Party Overlay */}
          <div className="absolute top-4 right-4 z-10">
            <Card className="w-80 bg-black/80 backdrop-blur border-white/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Watch Party</CardTitle>
                  <Button
                    onClick={() => setShowVideo(false)}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <WatchPartyStatusCard
                  participantCount={participants}
                  isPlaying={isVideoPlaying}
                  isConnected={isConnected}
                  isHost={isHost}
                  movieTitle={movieTitle}
                  compact={true}
                />
                <WatchPartyVideoSync
                  isHost={isHost}
                  currentTime={currentPlaybackTime}
                  isPlaying={isVideoPlaying}
                  onTimeUpdate={onSeek || (() => {})}
                  onPlayStateChange={handlePlayPause}
                  onSyncReceived={handleSyncReceived}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </WatchPartyErrorBoundary>
    );
  }

  return (
    <WatchPartyErrorBoundary onReset={onClose}>
      <Card className="w-full max-w-4xl mx-auto bg-background border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Watch Party</CardTitle>
              <p className="text-sm text-muted-foreground">{movieTitle}</p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="party" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Party
              </TabsTrigger>
              <TabsTrigger value="invite" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Invite
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Controls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="party" className="space-y-6 mt-6">
              <WatchPartyStatusCard
                participantCount={participants}
                isPlaying={isVideoPlaying}
                isConnected={isConnected}
                isHost={isHost}
                movieTitle={movieTitle}
              />

              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Room Code</h3>
                  <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                    {roomCode}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Share this code with friends to join your watch party
                  </p>
                </div>

                <Button onClick={handleStartWatching} size="lg" className="w-full">
                  <Play className="h-5 w-5 mr-2" />
                  Start Watching Together
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="invite" className="mt-6">
              <WatchPartyInvite
                sessionId={roomCode}
                movieTitle={movieTitle}
                onCopyCode={handleCopyCode}
                copied={copied}
              />
            </TabsContent>

            <TabsContent value="controls" className="mt-6">
              <WatchPartyControls
                isHost={isHost}
                currentTime={currentPlaybackTime}
                duration={videoDuration}
                volume={volume}
                isPlaying={isVideoPlaying}
                onPlayPause={handlePlayPause}
                onSeek={onSeek}
                onVolumeChange={onVolumeChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </WatchPartyErrorBoundary>
  );
};
