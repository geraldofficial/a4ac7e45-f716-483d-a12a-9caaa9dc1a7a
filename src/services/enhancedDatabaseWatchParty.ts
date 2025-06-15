
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface EnhancedWatchPartySession {
  id: string;
  host_id: string;
  movie_id: number;
  movie_title: string;
  movie_type: 'movie' | 'tv';
  playback_time: number;
  is_playing: boolean;
  sync_timestamp: string;
  sync_position: number;
  created_at: string;
  last_activity: string;
  expires_at: string;
  participants: EnhancedWatchPartyParticipant[];
}

export interface EnhancedWatchPartyParticipant {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  avatar: string;
  joined_at: string;
  is_active: boolean;
  last_seen: string;
}

export interface EnhancedWatchPartyMessage {
  id: string;
  session_id: string;
  user_id: string | null;
  username: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'sync';
}

export interface PlaybackSyncData {
  position: number;
  isPlaying: boolean;
  timestamp: string;
}

class EnhancedDatabaseWatchPartyService {
  private sessionChannel: RealtimeChannel | null = null;
  private messagesChannel: RealtimeChannel | null = null;
  private currentSessionId: string | null = null;
  private syncCallbacks: Map<string, (data: PlaybackSyncData) => void> = new Map();

  private generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createSession(movieId: number, movieTitle: string, movieType: 'movie' | 'tv'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let sessionId = this.generateSessionId();
    let attempts = 0;

    // Ensure unique session ID
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('watch_party_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      if (!existing) break;
      
      sessionId = this.generateSessionId();
      attempts++;
    }

    if (attempts >= 5) {
      throw new Error('Failed to generate unique session ID');
    }

    // Create session with sync fields
    const { data: session, error } = await supabase
      .from('watch_party_sessions')
      .insert({
        id: sessionId,
        host_id: user.id,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_type: movieType,
        playback_time: 0,
        is_playing: false,
        sync_timestamp: new Date().toISOString(),
        sync_position: 0
      })
      .select()
      .single();

    if (error) throw error;

    // Add host as participant
    await supabase
      .from('watch_party_participants')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Host',
        avatar: '👤'
      });

    // Add welcome message
    await supabase
      .from('watch_party_messages')
      .insert({
        session_id: sessionId,
        user_id: null,
        username: 'FlickPick',
        message: `Welcome to the watch party for "${movieTitle}"! Share code ${sessionId} with friends.`,
        type: 'system'
      });

    console.log(`Created enhanced watch party: ${sessionId}`);
    return sessionId;
  }

  async joinSession(sessionId: string): Promise<EnhancedWatchPartySession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const cleanSessionId = sessionId.trim().toUpperCase();

    // Check if session exists and is not expired
    const { data: session, error } = await supabase
      .from('watch_party_sessions')
      .select('*')
      .eq('id', cleanSessionId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      console.log(`Session not found or expired: ${cleanSessionId}`);
      return null;
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await supabase
      .from('watch_party_participants')
      .select('*')
      .eq('session_id', cleanSessionId)
      .eq('user_id', user.id)
      .single();

    if (!existingParticipant) {
      // Add user as participant
      await supabase
        .from('watch_party_participants')
        .insert({
          session_id: cleanSessionId,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar: '👤'
        });

      // Add join message
      await supabase
        .from('watch_party_messages')
        .insert({
          session_id: cleanSessionId,
          user_id: null,
          username: 'FlickPick',
          message: `${user.email?.split('@')[0] || 'User'} joined the party!`,
          type: 'system'
        });
    } else {
      // Mark existing participant as active
      await supabase
        .from('watch_party_participants')
        .update({ 
          is_active: true, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', existingParticipant.id);
    }

    return this.getSessionWithParticipants(cleanSessionId);
  }

  async syncPlayback(sessionId: string, position: number, isPlaying: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user is host or participant
    const { data: session } = await supabase
      .from('watch_party_sessions')
      .select('host_id')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    const isHost = session.host_id === user.id;
    const timestamp = new Date().toISOString();

    // Update session with sync data
    await supabase
      .from('watch_party_sessions')
      .update({
        playback_time: position,
        is_playing: isPlaying,
        sync_timestamp: timestamp,
        sync_position: position,
        last_activity: timestamp
      })
      .eq('id', sessionId);

    // Add sync message if it's the host making significant changes
    if (isHost) {
      const action = isPlaying ? 'resumed' : 'paused';
      const timeFormatted = this.formatTime(position);
      
      await supabase
        .from('watch_party_messages')
        .insert({
          session_id: sessionId,
          user_id: null,
          username: 'FlickPick',
          message: `Host ${action} playback at ${timeFormatted}`,
          type: 'sync'
        });
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    if (!message.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('watch_party_messages')
      .insert({
        session_id: sessionId.toUpperCase(),
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        message: message.trim(),
        type: 'message'
      });
  }

  async getMessages(sessionId: string): Promise<EnhancedWatchPartyMessage[]> {
    const { data, error } = await supabase
      .from('watch_party_messages')
      .select('*')
      .eq('session_id', sessionId.toUpperCase())
      .order('timestamp', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error getting messages:', error);
      return [];
    }

    return (data || []).map(msg => ({
      ...msg,
      type: msg.type as 'message' | 'system' | 'sync'
    }));
  }

  private async getSessionWithParticipants(sessionId: string): Promise<EnhancedWatchPartySession | null> {
    const { data: session, error: sessionError } = await supabase
      .from('watch_party_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) return null;

    const { data: participants, error: participantsError } = await supabase
      .from('watch_party_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true });

    if (participantsError) {
      console.error('Error getting participants:', participantsError);
      return null;
    }

    return {
      ...session,
      movie_type: session.movie_type as 'movie' | 'tv',
      participants: (participants || []).map(p => ({
        ...p,
        avatar: p.avatar || '👤',
        is_active: p.is_active || false,
        joined_at: p.joined_at || new Date().toISOString(),
        last_seen: p.last_seen || new Date().toISOString()
      }))
    };
  }

  // Real-time subscriptions
  subscribeToSession(sessionId: string, callback: (session: EnhancedWatchPartySession) => void): () => void {
    this.currentSessionId = sessionId;
    
    if (this.sessionChannel) {
      supabase.removeChannel(this.sessionChannel);
    }

    this.sessionChannel = supabase
      .channel(`enhanced-watch-party-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watch_party_sessions',
          filter: `id=eq.${sessionId}`
        },
        async () => {
          const session = await this.getSessionWithParticipants(sessionId);
          if (session) callback(session);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watch_party_participants',
          filter: `session_id=eq.${sessionId}`
        },
        async () => {
          const session = await this.getSessionWithParticipants(sessionId);
          if (session) callback(session);
        }
      )
      .subscribe();

    return () => {
      if (this.sessionChannel) {
        supabase.removeChannel(this.sessionChannel);
        this.sessionChannel = null;
      }
    };
  }

  subscribeToMessages(sessionId: string, callback: (messages: EnhancedWatchPartyMessage[]) => void): () => void {
    if (this.messagesChannel) {
      supabase.removeChannel(this.messagesChannel);
    }

    this.messagesChannel = supabase
      .channel(`enhanced-watch-party-messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'watch_party_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async () => {
          const messages = await this.getMessages(sessionId);
          callback(messages);
        }
      )
      .subscribe();

    return () => {
      if (this.messagesChannel) {
        supabase.removeChannel(this.messagesChannel);
        this.messagesChannel = null;
      }
    };
  }

  subscribeToPlaybackSync(sessionId: string, callback: (data: PlaybackSyncData) => void): () => void {
    const key = `sync_${sessionId}`;
    this.syncCallbacks.set(key, callback);

    // Subscribe to session changes for sync data
    const channel = supabase
      .channel(`playback-sync-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'watch_party_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          const session = payload.new;
          callback({
            position: parseFloat(session.sync_position || 0),
            isPlaying: session.is_playing || false,
            timestamp: session.sync_timestamp
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      this.syncCallbacks.delete(key);
    };
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('watch_party_sessions')
      .select('id')
      .eq('id', sessionId.trim().toUpperCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    return !error && !!data;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  cleanup(): void {
    if (this.sessionChannel) {
      supabase.removeChannel(this.sessionChannel);
      this.sessionChannel = null;
    }
    if (this.messagesChannel) {
      supabase.removeChannel(this.messagesChannel);
      this.messagesChannel = null;
    }
    this.syncCallbacks.clear();
    this.currentSessionId = null;
  }
}

export const enhancedDatabaseWatchPartyService = new EnhancedDatabaseWatchPartyService();
