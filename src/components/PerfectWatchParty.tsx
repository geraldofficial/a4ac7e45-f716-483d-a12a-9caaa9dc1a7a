import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  MessageCircle,
  Crown,
  Copy,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  LogOut,
  Send,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  perfectWatchPartyService,
  WatchPartySession,
  WatchPartyParticipant,
  WatchPartyMessage,
  PlaybackSyncEvent,
} from "@/services/perfectWatchParty";
import { SecureVideoPlayer } from "@/components/video/SecureVideoPlayer";
import { toast } from "sonner";

interface PerfectWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: "movie" | "tv";
  sessionId?: string;
  onClose: () => void;
}

export const PerfectWatchParty: React.FC<PerfectWatchPartyProps> = ({
  movieId,
  movieTitle,
  movieType,
  sessionId: initialSessionId,
  onClose,
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [session, setSession] = useState<WatchPartySession | null>(null);
  const [participants, setParticipants] = useState<WatchPartyParticipant[]>([]);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  // Video state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Setup mode
  const [setupMode, setSetupMode] = useState(!initialSessionId);
  const [joinCode, setJoinCode] = useState("");

  // Refs for cleanup
  const sessionUnsubscribe = useRef<(() => void) | null>(null);
  const messagesUnsubscribe = useRef<(() => void) | null>(null);
  const syncUnsubscribe = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionUnsubscribe.current) sessionUnsubscribe.current();
      if (messagesUnsubscribe.current) messagesUnsubscribe.current();
      if (syncUnsubscribe.current) syncUnsubscribe.current();
      perfectWatchPartyService.cleanup();
    };
  }, []);

  // Initialize session
  useEffect(() => {
    if (initialSessionId) {
      joinExistingSession(initialSessionId);
    } else {
      setLoading(false);
    }
  }, [initialSessionId]);

  // Setup real-time subscriptions when session is available
  useEffect(() => {
    if (session && user) {
      setIsHost(session.host_id === user.id);
      setupSubscriptions();
      loadInitialData();
    }
  }, [session, user]);

  const setupSubscriptions = useCallback(() => {
    if (!session) return;

    // Subscribe to session updates
    sessionUnsubscribe.current = perfectWatchPartyService.subscribeToSession(
      session.id,
      (updatedSession) => {
        if (updatedSession) {
          setSession(updatedSession);
        }
      },
    );

    // Subscribe to messages
    messagesUnsubscribe.current = perfectWatchPartyService.subscribeToMessages(
      session.id,
      setMessages,
    );

    // Subscribe to playback sync
    syncUnsubscribe.current = perfectWatchPartyService.subscribeToPlaybackSync(
      session.id,
      handlePlaybackSync,
    );
  }, [session]);

  const loadInitialData = async () => {
    if (!session) return;

    try {
      const [participantsData, messagesData] = await Promise.all([
        perfectWatchPartyService.getParticipants(session.id),
        perfectWatchPartyService.getMessages(session.id),
      ]);

      setParticipants(participantsData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const createNewSession = async () => {
    if (creating || !user) return;

    setCreating(true);
    try {
      const sessionId = await perfectWatchPartyService.createSession(
        movieId,
        movieTitle,
        movieType,
      );

      const newSession = await perfectWatchPartyService.getSession(sessionId);
      if (newSession) {
        setSession(newSession);
        setSetupMode(false);
        toast.success(`Created watch party! Code: ${sessionId}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create watch party");
    } finally {
      setCreating(false);
    }
  };

  const joinExistingSession = async (sessionId: string) => {
    if (joining) return;

    setJoining(true);
    try {
      const joinedSession =
        await perfectWatchPartyService.joinSession(sessionId);
      if (joinedSession) {
        setSession(joinedSession);
        setSetupMode(false);
        toast.success("Joined watch party!");
      } else {
        toast.error("Watch party not found or expired");
      }
    } catch (error) {
      console.error("Error joining session:", error);
      toast.error("Failed to join watch party");
    } finally {
      setJoining(false);
      setLoading(false);
    }
  };

  const handleJoinWithCode = () => {
    if (joinCode.trim()) {
      joinExistingSession(joinCode.trim().toUpperCase());
    }
  };

  const handlePlaybackSync = useCallback(
    (syncData: PlaybackSyncEvent) => {
      if (isHost || !videoRef.current) return;

      const video = videoRef.current;
      const timeDiff = Math.abs(video.currentTime - syncData.position);

      // Only sync if time difference is significant (>2 seconds)
      if (timeDiff > 2) {
        video.currentTime = syncData.position;
      }

      // Sync play/pause state
      if (syncData.is_playing && video.paused) {
        video.play().catch(console.error);
      } else if (!syncData.is_playing && !video.paused) {
        video.pause();
      }

      setCurrentTime(syncData.position);
      setIsPlaying(syncData.is_playing);
    },
    [isHost],
  );

  const handleVideoTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleVideoPlay = useCallback(async () => {
    if (!isHost || !session) return;

    setIsPlaying(true);
    try {
      await perfectWatchPartyService.updatePlayback(
        session.id,
        currentTime,
        true,
      );
    } catch (error) {
      console.error("Error updating playback:", error);
    }
  }, [isHost, session, currentTime]);

  const handleVideoPause = useCallback(async () => {
    if (!isHost || !session) return;

    setIsPlaying(false);
    try {
      await perfectWatchPartyService.updatePlayback(
        session.id,
        currentTime,
        false,
      );
    } catch (error) {
      console.error("Error updating playback:", error);
    }
  }, [isHost, session, currentTime]);

  const handleVideoSeek = useCallback(
    async (time: number) => {
      if (!isHost || !session) return;

      setCurrentTime(time);
      try {
        await perfectWatchPartyService.updatePlayback(
          session.id,
          time,
          isPlaying,
        );
      } catch (error) {
        console.error("Error updating playback:", error);
      }
    },
    [isHost, session, isPlaying],
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    try {
      await perfectWatchPartyService.sendMessage(session.id, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const copyInviteLink = () => {
    if (!session) return;

    const inviteUrl = `${window.location.origin}/watch-party/${session.id}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied!");
  };

  const shareParty = async () => {
    if (!session) return;

    const shareData = {
      title: `Join my watch party for ${movieTitle}`,
      text: `Watch ${movieTitle} together! Join with code: ${session.id}`,
      url: `${window.location.origin}/watch-party/${session.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyInviteLink();
      }
    } catch (error) {
      copyInviteLink();
    }
  };

  const leaveParty = async () => {
    if (!session) return;

    try {
      await perfectWatchPartyService.leaveSession(session.id);
      onClose();
    } catch (error) {
      console.error("Error leaving party:", error);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-white">Loading watch party...</p>
        </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-800 bg-gray-900">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Watch Party</CardTitle>
            <p className="text-gray-400">{movieTitle}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={createNewSession}
                disabled={creating}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Create New Party
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Enter party code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-gray-800 border-gray-700 text-white text-center text-lg tracking-widest"
                />
                <Button
                  onClick={handleJoinWithCode}
                  disabled={!joinCode.trim() || joining}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300"
                  size="lg"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2" />
                      Joining...
                    </>
                  ) : (
                    "Join Party"
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-400"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Session not found</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{movieTitle}</h1>
            <Badge variant="secondary" className="bg-red-600">
              {session.id}
            </Badge>
            {isHost && <Crown className="h-5 w-5 text-yellow-500" />}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={shareParty}
              variant="outline"
              size="sm"
              className="border-gray-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={leaveParty}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Video Area */}
        <div className="flex-1 bg-black relative">
          <SecureVideoPlayer
            ref={videoRef}
            tmdbId={movieId}
            type={movieType}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onSeeking={handleVideoSeek}
            className="w-full h-full"
          />

          {/* Video Controls Overlay */}
          {isHost && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/80 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Host Controls</span>
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          {/* Participants */}
          {showParticipants && (
            <div className="border-b border-gray-800 p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Participants ({session.participant_count})
              </h3>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {participant.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{participant.username}</span>
                      {participant.is_host && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Chat */}
          {showChat && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </h3>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`text-sm ${
                        message.type === "system"
                          ? "text-gray-400 italic text-center"
                          : ""
                      }`}
                    >
                      {message.type === "message" ? (
                        <>
                          <span className="font-medium text-blue-400">
                            {message.username}:
                          </span>{" "}
                          <span>{message.message}</span>
                        </>
                      ) : (
                        <span>{message.message}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfectWatchParty;
