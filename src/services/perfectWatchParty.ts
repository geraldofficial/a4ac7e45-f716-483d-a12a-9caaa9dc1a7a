import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface WatchPartySession {
  id: string;
  host_id: string;
  movie_id: number;
  movie_title: string;
  movie_type: "movie" | "tv";
  playback_time: number;
  is_playing: boolean;
  created_at: string;
  expires_at: string;
  participant_count: number;
}

export interface WatchPartyParticipant {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  avatar: string;
  is_host: boolean;
  joined_at: string;
  last_seen: string;
}

export interface WatchPartyMessage {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  message: string;
  type: "message" | "system" | "sync";
  created_at: string;
}

export interface PlaybackSyncEvent {
  position: number;
  is_playing: boolean;
  timestamp: string;
  host_id: string;
}

class PerfectWatchPartyService {
  private sessionChannel: RealtimeChannel | null = null;
  private messageChannel: RealtimeChannel | null = null;
  private syncChannel: RealtimeChannel | null = null;
  private currentSessionId: string | null = null;

  // Generate unique 6-character session ID
  private generateSessionId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new watch party session
  async createSession(
    movieId: number,
    movieTitle: string,
    movieType: "movie" | "tv",
  ): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Generate unique session ID
    let sessionId = this.generateSessionId();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("watch_party_sessions")
        .select("id")
        .eq("id", sessionId)
        .single();

      if (!existing) break;
      sessionId = this.generateSessionId();
      attempts++;
    }

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const { data: session, error } = await supabase
      .from("watch_party_sessions")
      .insert({
        id: sessionId,
        host_id: user.id,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_type: movieType,
        playback_time: 0,
        is_playing: false,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Add host as participant
    await this.joinSession(sessionId);

    // Send welcome message
    await this.sendSystemMessage(
      sessionId,
      `Welcome to the watch party for "${movieTitle}"! Share code ${sessionId} with friends.`,
    );

    return sessionId;
  }

  // Join an existing session
  async joinSession(sessionId: string): Promise<WatchPartySession | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const cleanSessionId = sessionId.trim().toUpperCase();

    // Check if session exists and is not expired
    const { data: session, error } = await supabase
      .from("watch_party_sessions")
      .select("*")
      .eq("id", cleanSessionId)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) return null;

    // Check if already a participant
    const { data: existingParticipant } = await supabase
      .from("watch_party_participants")
      .select("*")
      .eq("session_id", cleanSessionId)
      .eq("user_id", user.id)
      .single();

    if (!existingParticipant) {
      // Add as new participant
      await supabase.from("watch_party_participants").insert({
        session_id: cleanSessionId,
        user_id: user.id,
        username: user.email?.split("@")[0] || "User",
        avatar: "👤",
        is_host: session.host_id === user.id,
        last_seen: new Date().toISOString(),
      });

      // Send join message
      if (session.host_id !== user.id) {
        await this.sendSystemMessage(
          cleanSessionId,
          `${user.email?.split("@")[0] || "User"} joined the party!`,
        );
      }
    } else {
      // Update last seen
      await supabase
        .from("watch_party_participants")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", existingParticipant.id);
    }

    return this.getSession(cleanSessionId);
  }

  // Get session details with participant count
  async getSession(sessionId: string): Promise<WatchPartySession | null> {
    const { data: session, error } = await supabase
      .from("watch_party_sessions")
      .select("*")
      .eq("id", sessionId.toUpperCase())
      .single();

    if (error || !session) return null;

    // Get participant count
    const { count } = await supabase
      .from("watch_party_participants")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId.toUpperCase())
      .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes

    return {
      ...session,
      participant_count: count || 0,
    };
  }

  // Get session participants
  async getParticipants(sessionId: string): Promise<WatchPartyParticipant[]> {
    const { data, error } = await supabase
      .from("watch_party_participants")
      .select("*")
      .eq("session_id", sessionId.toUpperCase())
      .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching participants:", error);
      return [];
    }

    return data || [];
  }

  // Send chat message
  async sendMessage(sessionId: string, message: string): Promise<void> {
    if (!message.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    await supabase.from("watch_party_messages").insert({
      session_id: sessionId.toUpperCase(),
      user_id: user.id,
      username: user.email?.split("@")[0] || "User",
      message: message.trim(),
      type: "message",
    });
  }

  // Send system message
  private async sendSystemMessage(
    sessionId: string,
    message: string,
  ): Promise<void> {
    await supabase.from("watch_party_messages").insert({
      session_id: sessionId.toUpperCase(),
      user_id: null,
      username: "FlickPick",
      message,
      type: "system",
    });
  }

  // Update playback state (host only)
  async updatePlayback(
    sessionId: string,
    position: number,
    isPlaying: boolean,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Verify user is host
    const session = await this.getSession(sessionId);
    if (!session || session.host_id !== user.id) {
      throw new Error("Only the host can control playback");
    }

    // Update session
    await supabase
      .from("watch_party_sessions")
      .update({
        playback_time: position,
        is_playing: isPlaying,
      })
      .eq("id", sessionId.toUpperCase());

    // Broadcast sync event
    const syncEvent: PlaybackSyncEvent = {
      position,
      is_playing: isPlaying,
      timestamp: new Date().toISOString(),
      host_id: user.id,
    };

    if (this.syncChannel) {
      this.syncChannel.send({
        type: "broadcast",
        event: "playback_sync",
        payload: syncEvent,
      });
    }

    // Send sync message
    const action = isPlaying ? "resumed" : "paused";
    await this.sendSystemMessage(
      sessionId,
      `Playback ${action} at ${this.formatTime(position)}`,
    );
  }

  // Get messages
  async getMessages(sessionId: string): Promise<WatchPartyMessage[]> {
    const { data, error } = await supabase
      .from("watch_party_messages")
      .select("*")
      .eq("session_id", sessionId.toUpperCase())
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data || [];
  }

  // Leave session
  async leaveSession(sessionId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("watch_party_participants")
      .delete()
      .eq("session_id", sessionId.toUpperCase())
      .eq("user_id", user.id);

    // Send leave message
    await this.sendSystemMessage(
      sessionId,
      `${user.email?.split("@")[0] || "User"} left the party`,
    );
  }

  // Real-time subscriptions
  subscribeToSession(
    sessionId: string,
    callback: (session: WatchPartySession | null) => void,
  ): () => void {
    this.currentSessionId = sessionId.toUpperCase();

    if (this.sessionChannel) {
      supabase.removeChannel(this.sessionChannel);
    }

    this.sessionChannel = supabase
      .channel(`watch-party-session-${this.currentSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_party_sessions",
          filter: `id=eq.${this.currentSessionId}`,
        },
        async () => {
          const session = await this.getSession(this.currentSessionId!);
          callback(session);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_party_participants",
          filter: `session_id=eq.${this.currentSessionId}`,
        },
        async () => {
          const session = await this.getSession(this.currentSessionId!);
          callback(session);
        },
      )
      .subscribe();

    return () => {
      if (this.sessionChannel) {
        supabase.removeChannel(this.sessionChannel);
        this.sessionChannel = null;
      }
    };
  }

  subscribeToMessages(
    sessionId: string,
    callback: (messages: WatchPartyMessage[]) => void,
  ): () => void {
    const cleanSessionId = sessionId.toUpperCase();

    if (this.messageChannel) {
      supabase.removeChannel(this.messageChannel);
    }

    this.messageChannel = supabase
      .channel(`watch-party-messages-${cleanSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "watch_party_messages",
          filter: `session_id=eq.${cleanSessionId}`,
        },
        async () => {
          const messages = await this.getMessages(cleanSessionId);
          callback(messages);
        },
      )
      .subscribe();

    return () => {
      if (this.messageChannel) {
        supabase.removeChannel(this.messageChannel);
        this.messageChannel = null;
      }
    };
  }

  subscribeToPlaybackSync(
    sessionId: string,
    callback: (syncData: PlaybackSyncEvent) => void,
  ): () => void {
    const cleanSessionId = sessionId.toUpperCase();

    if (this.syncChannel) {
      supabase.removeChannel(this.syncChannel);
    }

    this.syncChannel = supabase
      .channel(`watch-party-sync-${cleanSessionId}`)
      .on("broadcast", { event: "playback_sync" }, ({ payload }) => {
        callback(payload as PlaybackSyncEvent);
      })
      .subscribe();

    return () => {
      if (this.syncChannel) {
        supabase.removeChannel(this.syncChannel);
        this.syncChannel = null;
      }
    };
  }

  // Check if session exists
  async sessionExists(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("watch_party_sessions")
      .select("id")
      .eq("id", sessionId.toUpperCase())
      .gt("expires_at", new Date().toISOString())
      .single();

    return !error && !!data;
  }

  // Utility function to format time
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  // Cleanup
  cleanup(): void {
    if (this.sessionChannel) {
      supabase.removeChannel(this.sessionChannel);
      this.sessionChannel = null;
    }
    if (this.messageChannel) {
      supabase.removeChannel(this.messageChannel);
      this.messageChannel = null;
    }
    if (this.syncChannel) {
      supabase.removeChannel(this.syncChannel);
      this.syncChannel = null;
    }
    this.currentSessionId = null;
  }
}

export const perfectWatchPartyService = new PerfectWatchPartyService();
