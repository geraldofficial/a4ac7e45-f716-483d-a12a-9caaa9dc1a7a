
import { supabase } from '@/integrations/supabase/client';

export interface WatchPartySession {
  id: string;
  host_id: string;
  movie_id: number;
  movie_title: string;
  movie_type: 'movie' | 'tv';
  current_time: number;
  is_playing: boolean;
  created_at: string;
  participants: WatchPartyParticipant[];
}

export interface WatchPartyParticipant {
  user_id: string;
  username: string;
  avatar: string;
  joined_at: string;
}

export interface WatchPartyMessage {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
}

class WatchPartyService {
  async createSession(movieId: number, movieTitle: string, movieType: 'movie' | 'tv'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate a simpler, more reliable session ID
    const sessionId = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const session: WatchPartySession = {
      id: sessionId,
      host_id: user.id,
      movie_id: movieId,
      movie_title: movieTitle,
      movie_type: movieType,
      current_time: 0,
      is_playing: false,
      created_at: new Date().toISOString(),
      participants: [{
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Host',
        avatar: '👤',
        joined_at: new Date().toISOString()
      }]
    };

    localStorage.setItem(`watchParty_${sessionId}`, JSON.stringify(session));
    
    // Also store in a global sessions list for easier lookup
    const allSessions = JSON.parse(localStorage.getItem('watchPartySessions') || '[]');
    allSessions.push(sessionId);
    localStorage.setItem('watchPartySessions', JSON.stringify(allSessions));
    
    return sessionId;
  }

  async joinSession(sessionId: string): Promise<WatchPartySession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Clean the session ID
    const cleanSessionId = sessionId.trim().toUpperCase();
    
    const sessionData = localStorage.getItem(`watchParty_${cleanSessionId}`);
    if (!sessionData) {
      console.log('Session not found:', cleanSessionId);
      return null;
    }

    const session: WatchPartySession = JSON.parse(sessionData);
    
    // Add user to participants if not already there
    const existingParticipant = session.participants.find(p => p.user_id === user.id);
    if (!existingParticipant) {
      session.participants.push({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        avatar: '👤',
        joined_at: new Date().toISOString()
      });
      localStorage.setItem(`watchParty_${cleanSessionId}`, JSON.stringify(session));
    }

    return session;
  }

  async updatePlaybackState(sessionId: string, currentTime: number, isPlaying: boolean): Promise<void> {
    const sessionData = localStorage.getItem(`watchParty_${sessionId}`);
    if (!sessionData) return;

    const session: WatchPartySession = JSON.parse(sessionData);
    session.current_time = currentTime;
    session.is_playing = isPlaying;
    
    localStorage.setItem(`watchParty_${sessionId}`, JSON.stringify(session));
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chatMessage: WatchPartyMessage = {
      id: messageId,
      session_id: sessionId,
      user_id: user.id,
      username: user.email?.split('@')[0] || 'User',
      message,
      timestamp: new Date().toISOString()
    };

    const existingMessages = JSON.parse(localStorage.getItem(`watchPartyChat_${sessionId}`) || '[]');
    existingMessages.push(chatMessage);
    localStorage.setItem(`watchPartyChat_${sessionId}`, JSON.stringify(existingMessages));
  }

  async getMessages(sessionId: string): Promise<WatchPartyMessage[]> {
    const messages = localStorage.getItem(`watchPartyChat_${sessionId}`);
    return messages ? JSON.parse(messages) : [];
  }

  // Helper method to check if session exists
  sessionExists(sessionId: string): boolean {
    const cleanSessionId = sessionId.trim().toUpperCase();
    return localStorage.getItem(`watchParty_${cleanSessionId}`) !== null;
  }
}

export const watchPartyService = new WatchPartyService();
