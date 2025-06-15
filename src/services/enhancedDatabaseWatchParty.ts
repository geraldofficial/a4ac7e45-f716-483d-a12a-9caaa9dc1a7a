
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedWatchPartySession {
  id: string;
  host_id: string;
  movie_id: number;
  movie_title: string;
  movie_type: 'movie' | 'tv';
  playback_time: number;
  is_playing: boolean;
  sync_position: number;
  sync_timestamp: string;
  created_at: string;
  participants: EnhancedWatchPartyParticipant[];
}

export interface EnhancedWatchPartyParticipant {
  user_id: string;
  username: string;
  avatar: string;
  joined_at: string;
  is_active: boolean;
}

export interface EnhancedWatchPartyMessage {
  id: string;
  session_id: string;
  user_id: string;
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
  private subscriptions: { [key: string]: any } = {};

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

    const sessionId = this.generateSessionId();
    
    const { error } = await supabase
      .from('watch_party_sessions')
      .insert({
        id: sessionId,
        host_id: user.id,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_type: movieType,
        playback_time: 0,
        is_playing: false,
        sync_position: 0,
        sync_timestamp: new Date().toISOString()
      });

    if (error) throw error;

    // Add host as participant
    await this.addParticipant(sessionId, user);

    console.log(`Created watch party session: ${sessionId}`);
    return sessionId;
  }

  async joinSession(sessionId: string): Promise<EnhancedWatchPartySession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('watch_party_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return null;
    }

    // Add user as participant if not already added
    await this.addParticipant(sessionId, user);

    // Get all participants
    const participants = await this.getParticipants(sessionId);

    return {
      ...session,
      participants
    };
  }

  private async addParticipant(sessionId: string, user: any): Promise<void> {
    const username = user.email?.split('@')[0] || 'User';
    
    const { error } = await supabase
      .from('watch_party_participants')
      .upsert({
        session_id: sessionId,
        user_id: user.id,
        username,
        avatar: '👤',
        is_active: true
      }, {
        onConflict: 'session_id,user_id'
      });

    if (error && !error.message.includes('duplicate')) {
      console.error('Error adding participant:', error);
    }

    // Send join message
    await this.sendSystemMessage(sessionId, `${username} joined the party!`);
  }

  async syncPlayback(sessionId: string, position: number, isPlaying: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('watch_party_sessions')
      .update({
        playback_time: position,
        is_playing: isPlaying,
        sync_position: position,
        sync_timestamp: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('host_id', user.id); // Only host can sync

    if (error) {
      console.error('Error syncing playback:', error);
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const username = user.email?.split('@')[0] || 'User';

    const { error } = await supabase
      .from('watch_party_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        username,
        message,
        type: 'message'
      });

    if (error) throw error;
  }

  private async sendSystemMessage(sessionId: string, message: string): Promise<void> {
    const { error } = await supabase
      .from('watch_party_messages')
      .insert({
        session_id: sessionId,
        user_id: null,
        username: 'FlickPick',
        message,
        type: 'system'
      });

    if (error) console.error('Error sending system message:', error);
  }

  async getMessages(sessionId: string): Promise<EnhancedWatchPartyMessage[]> {
    const { data, error } = await supabase
      .from('watch_party_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private async getParticipants(sessionId: string): Promise<EnhancedWatchPartyParticipant[]> {
    const { data, error } = await supabase
      .from('watch_party_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('watch_party_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    return !error && !!data;
  }

  subscribeToSession(sessionId: string, callback: (session: EnhancedWatchPartySession) => void): () => void {
    const channelName = `session-${sessionId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'watch_party_sessions',
        filter: `id=eq.${sessionId}`
      }, async () => {
        const session = await this.joinSession(sessionId);
        if (session) callback(session);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'watch_party_participants',
        filter: `session_id=eq.${sessionId}`
      }, async () => {
        const session = await this.joinSession(sessionId);
        if (session) callback(session);
      })
      .subscribe();

    this.subscriptions[channelName] = channel;

    return () => {
      supabase.removeChannel(channel);
      delete this.subscriptions[channelName];
    };
  }

  subscribeToMessages(sessionId: string, callback: (messages: EnhancedWatchPartyMessage[]) => void): () => void {
    const channelName = `messages-${sessionId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'watch_party_messages',
        filter: `session_id=eq.${sessionId}`
      }, async () => {
        const messages = await this.getMessages(sessionId);
        callback(messages);
      })
      .subscribe();

    this.subscriptions[channelName] = channel;

    return () => {
      supabase.removeChannel(channel);
      delete this.subscriptions[channelName];
    };
  }

  subscribeToPlaybackSync(sessionId: string, callback: (data: PlaybackSyncData) => void): () => void {
    const channelName = `sync-${sessionId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'watch_party_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        const newData = payload.new as any;
        callback({
          position: newData.sync_position,
          isPlaying: newData.is_playing,
          timestamp: newData.sync_timestamp
        });
      })
      .subscribe();

    this.subscriptions[channelName] = channel;

    return () => {
      supabase.removeChannel(channel);
      delete this.subscriptions[channelName];
    };
  }

  cleanup(): void {
    Object.values(this.subscriptions).forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.subscriptions = {};
  }
}

export const enhancedDatabaseWatchPartyService = new EnhancedDatabaseWatchPartyService();
