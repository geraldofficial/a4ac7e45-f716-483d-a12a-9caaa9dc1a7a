
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DatabaseWatchPartySession {
  id: string;
  host_id: string;
  movie_id: number;
  movie_title: string;
  movie_type: 'movie' | 'tv';
  playback_time: number;
  is_playing: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;
  current_time: number; // Add this property for compatibility
  participants: DatabaseWatchPartyParticipant[];
}

export interface DatabaseWatchPartyParticipant {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  avatar: string;
  joined_at: string;
  is_active: boolean;
  last_seen: string;
}

export interface DatabaseWatchPartyMessage {
  id: string;
  session_id: string;
  user_id: string | null;
  username: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'sync';
}

class DatabaseWatchPartyService {
  private channel: RealtimeChannel | null = null;
  private currentSessionId: string | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

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

    // Create session
    const { data: session, error } = await supabase
      .from('watch_party_sessions')
      .insert({
        id: sessionId,
        host_id: user.id,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_type: movieType,
        playback_time: 0,
        is_playing: false
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
        message: `Welcome to the watch party for "${movieTitle}"! Share the code ${sessionId} with friends to join.`,
        type: 'system'
      });

    console.log(`Created watch party session: ${sessionId}`);
    return sessionId;
  }

  async joinSession(sessionId: string): Promise<DatabaseWatchPartySession | null> {
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
        .update({ is_active: true, last_seen: new Date().toISOString() })
        .eq('id', existingParticipant.id);
    }

    return this.getSessionWithParticipants(cleanSessionId);
  }

  async updatePlaybackState(sessionId: string, playbackTime: number, isPlaying: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user is the host
    const { data: session } = await supabase
      .from('watch_party_sessions')
      .select('host_id')
      .eq('id', sessionId)
      .single();

    if (!session || session.host_id !== user.id) {
      console.warn('Only host can update playback state');
      return;
    }

    // Update session
    await supabase
      .from('watch_party_sessions')
      .update({
        playback_time: playbackTime,
        is_playing: isPlaying,
        last_activity: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Add sync message
    await supabase
      .from('watch_party_messages')
      .insert({
        session_id: sessionId,
        user_id: null,
        username: 'FlickPick',
        message: isPlaying ? 'Playback resumed' : 'Playback paused',
        type: 'sync'
      });
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

  async getMessages(sessionId: string): Promise<DatabaseWatchPartyMessage[]> {
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

    // Type cast to ensure proper typing
    return (data || []).map(msg => ({
      ...msg,
      type: msg.type as 'message' | 'system' | 'sync'
    }));
  }

  async getSession(sessionId: string): Promise<DatabaseWatchPartySession | null> {
    return this.getSessionWithParticipants(sessionId.toUpperCase());
  }

  private async getSessionWithParticipants(sessionId: string): Promise<DatabaseWatchPartySession | null> {
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

    // Type cast and add current_time for compatibility
    return {
      ...session,
      movie_type: session.movie_type as 'movie' | 'tv',
      current_time: session.playback_time || 0,
      participants: (participants || []).map(p => ({
        ...p,
        avatar: p.avatar || '👤',
        is_active: p.is_active || false,
        joined_at: p.joined_at || new Date().toISOString(),
        last_seen: p.last_seen || new Date().toISOString()
      }))
    };
  }

  // Real-time subscription methods
  subscribeToSession(sessionId: string, callback: (session: DatabaseWatchPartySession) => void): () => void {
    this.currentSessionId = sessionId;
    
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    this.channel = supabase
      .channel(`watch-party-${sessionId}`)
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

    const key = `session_${sessionId}_${Date.now()}`;
    this.listeners.set(key, callback);

    return () => {
      this.listeners.delete(key);
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }

  subscribeToMessages(sessionId: string, callback: (messages: DatabaseWatchPartyMessage[]) => void): () => void {
    const channel = supabase
      .channel(`watch-party-messages-${sessionId}`)
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
      supabase.removeChannel(channel);
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

  cleanup(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
    this.currentSessionId = null;
  }

  async cleanupExpiredSessions(): Promise<void> {
    await supabase.rpc('cleanup_expired_watch_party_sessions');
  }
}

export const databaseWatchPartyService = new DatabaseWatchPartyService();
