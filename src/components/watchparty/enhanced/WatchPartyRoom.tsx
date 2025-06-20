import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  MessageCircle,
  Settings,
  Crown,
  UserPlus,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Copy,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SecureVideoPlayer } from "@/components/video/SecureVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn, formatError } from "@/lib/utils";
import { toast } from "sonner";

interface WatchPartyParticipant {
  id: string;
  user_id: string;
  is_host: boolean;
  joined_at: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar: string;
  };
}

interface WatchPartyMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar: string;
  };
}

interface WatchPartyState {
  is_playing: boolean;
  current_time: number;
  playback_rate: number;
  updated_by: string;
  updated_at: string;
}

interface WatchPartyRoomProps {
  partyId: string;
  movieSrc: string;
  movieTitle: string;
  moviePoster?: string;
  onLeave?: () => void;
}

export const WatchPartyRoom: React.FC<WatchPartyRoomProps> = ({
  partyId,
  movieSrc,
  movieTitle,
  moviePoster,
  onLeave,
}) => {
  const { user } = useAuthState();

  // State
  const [participants, setParticipants] = useState<WatchPartyParticipant[]>([]);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [partyState, setPartyState] = useState<WatchPartyState>({
    is_playing: false,
    current_time: 0,
    playback_rate: 1,
    updated_by: "",
    updated_at: "",
  });
  const [isHost, setIsHost] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastStateUpdate = useRef<string>("");

  // Real-time subscriptions
  useEffect(() => {
    if (!partyId || !user) return;

    // Subscribe to participants
    const participantsChannel = supabase
      .channel(`watch_party_participants_${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_party_participants",
          filter: `watch_party_id=eq.${partyId}`,
        },
        () => {
          fetchParticipants();
        },
      )
      .subscribe();

    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`watch_party_messages_${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "watch_party_messages",
          filter: `watch_party_id=eq.${partyId}`,
        },
        (payload) => {
          if (payload.new) {
            fetchMessages();
          }
        },
      )
      .subscribe();

    // Subscribe to party state
    const stateChannel = supabase
      .channel(`watch_party_state_${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "watch_parties",
          filter: `id=eq.${partyId}`,
        },
        (payload) => {
          if (payload.new && payload.new.updated_by !== user.id) {
            const newState = payload.new as any;
            setPartyState({
              is_playing: newState.is_playing,
              current_time: newState.current_time,
              playback_rate: newState.playback_rate,
              updated_by: newState.updated_by,
              updated_at: newState.updated_at,
            });
          }
        },
      )
      .subscribe();

    // Initial data fetch
    fetchParticipants();
    fetchMessages();
    fetchPartyState();

    return () => {
      participantsChannel.unsubscribe();
      messagesChannel.unsubscribe();
      stateChannel.unsubscribe();
    };
  }, [partyId, user]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Data fetching functions
  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("watch_party_participants")
        .select(
          `
          *,
          profiles (username, full_name, avatar)
        `,
        )
        .eq("watch_party_id", partyId);

      if (error) throw error;
      setParticipants(data || []);

      // Check if current user is host
      const currentUserParticipant = data?.find((p) => p.user_id === user?.id);
      setIsHost(currentUserParticipant?.is_host || false);
    } catch (error) {
      console.error("Error fetching participants:", formatError(error));
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("watch_party_messages")
        .select(
          `
          *,
          profiles (username, full_name, avatar)
        `,
        )
        .eq("watch_party_id", partyId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", formatError(error));
    }
  };

  const fetchPartyState = async () => {
    try {
      const { data, error } = await supabase
        .from("watch_parties")
        .select(
          "is_playing, current_time, playback_rate, updated_by, updated_at",
        )
        .eq("id", partyId)
        .single();

      if (error) throw error;
      if (data) {
        setPartyState({
          is_playing: data.is_playing,
          current_time: data.current_time,
          playback_rate: data.playback_rate,
          updated_by: data.updated_by,
          updated_at: data.updated_at,
        });
      }
    } catch (error) {
      console.error("Error fetching party state:", formatError(error));
    }
  };

  // Actions
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from("watch_party_messages").insert({
        watch_party_id: partyId,
        user_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      toast.error(`Failed to send message: ${formatError(error)}`);
    }
  };

  const updatePartyState = async (updates: Partial<WatchPartyState>) => {
    if (!isHost || !user) return;

    try {
      const { error } = await supabase
        .from("watch_parties")
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", partyId);

      if (error) throw error;
    } catch (error) {
      toast.error(`Failed to update party state: ${formatError(error)}`);
    }
  };

  const handleVideoStateChange = useCallback(
    (newState: Partial<WatchPartyState>) => {
      if (isHost) {
        updatePartyState(newState);
      }
    },
    [isHost],
  );

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/watch-party/${partyId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  const leaveParty = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("watch_party_participants")
        .delete()
        .eq("watch_party_id", partyId)
        .eq("user_id", user.id);

      if (error) throw error;
      onLeave?.();
    } catch (error) {
      toast.error(`Failed to leave party: ${formatError(error)}`);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">{movieTitle}</h1>
            {isHost && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowParticipants(!showParticipants)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Users className="h-4 w-4 mr-1" />
              {participants.length}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={copyInviteLink}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={leaveParty}
              className="border-gray-700 text-red-400 hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Video section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black relative">
            <SecureVideoPlayer
              src={movieSrc}
              title={movieTitle}
              poster={moviePoster}
              className="w-full h-full"
              onTimeUpdate={(currentTime, duration) => {
                if (
                  isHost &&
                  Math.abs(currentTime - partyState.current_time) > 2
                ) {
                  handleVideoStateChange({ current_time: currentTime });
                }
              }}
            />

            {/* Sync indicator */}
            {!isHost && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                Synced with host
              </div>
            )}
          </div>

          {/* Host controls */}
          {isHost && (
            <div className="bg-gray-900 border-t border-gray-800 p-4">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleVideoStateChange({
                      current_time: Math.max(0, partyState.current_time - 10),
                    })
                  }
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    handleVideoStateChange({
                      is_playing: !partyState.is_playing,
                    })
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {partyState.is_playing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleVideoStateChange({
                      current_time: partyState.current_time + 10,
                    })
                  }
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className={cn(
            "w-80 bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-300",
            isChatCollapsed && "w-12",
          )}
        >
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            {!isChatCollapsed && (
              <h3 className="text-lg font-semibold text-white">Chat</h3>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              className="text-gray-400 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {!isChatCollapsed && (
            <>
              {/* Participants */}
              {showParticipants && (
                <div className="border-b border-gray-800 p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Participants ({participants.length})
                  </h4>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-3"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.profiles?.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.profiles?.username?.[0] ||
                              participant.profiles?.full_name?.[0] ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {participant.profiles?.full_name ||
                              participant.profiles?.username ||
                              "Anonymous"}
                          </p>
                          {participant.is_host && (
                            <Badge
                              size="sm"
                              className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            >
                              Host
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.profiles?.avatar} />
                        <AvatarFallback className="text-xs">
                          {message.profiles?.username?.[0] ||
                            message.profiles?.full_name?.[0] ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-white">
                            {message.profiles?.full_name ||
                              message.profiles?.username ||
                              "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
