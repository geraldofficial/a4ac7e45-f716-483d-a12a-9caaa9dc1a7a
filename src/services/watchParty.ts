
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
  private generateSessionId(): string {
    // Generate a more reliable 6-character session ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getStorageKey(sessionId: string): string {
    return `watchParty_${sessionId.toUpperCase()}`;
  }

  private getChatKey(sessionId: string): string {
    return `watchPartyChat_${sessionId.toUpperCase()}`;
  }

  async createSession(movieId: number, movieTitle: string, movieType: 'movie' | 'tv'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const sessionId = this.generateSessionId();
    
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

    // Store session data
    localStorage.setItem(this.getStorageKey(sessionId), JSON.stringify(session));
    
    // Initialize empty chat
    localStorage.setItem(this.getChatKey(sessionId), JSON.stringify([]));
    
    // Store in global sessions list
    const allSessions = JSON.parse(localStorage.getItem('watchPartySessions') || '[]');
    if (!allSessions.includes(sessionId)) {
      allSessions.push(sessionId);
      localStorage.setItem('watchPartySessions', JSON.stringify(allSessions));
    }
    
    console.log(`Created watch party session: ${sessionId}`);
    return sessionId;
  }

  async joinSession(sessionId: string): Promise<WatchPartySession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const cleanSessionId = sessionId.trim().toUpperCase();
    console.log(`Attempting to join session: ${cleanSessionId}`);
    
    const sessionData = localStorage.getItem(this.getStorageKey(cleanSessionId));
    if (!sessionData) {
      console.log(`Session not found: ${cleanSessionId}`);
      return null;
    }

    try {
      const session: WatchPartySession = JSON.parse(sessionData);
      
      // Check if user is already a participant
      const existingParticipant = session.participants.find(p => p.user_id === user.id);
      if (!existingParticipant) {
        session.participants.push({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar: '👤',
          joined_at: new Date().toISOString()
        });
        
        // Save updated session
        localStorage.setItem(this.getStorageKey(cleanSessionId), JSON.stringify(session));
        console.log(`User joined session: ${cleanSessionId}`);
      }

      return session;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }

  async updatePlaybackState(sessionId: string, currentTime: number, isPlaying: boolean): Promise<void> {
    const cleanSessionId = sessionId.toUpperCase();
    const sessionData = localStorage.getItem(this.getStorageKey(cleanSessionId));
    if (!sessionData) return;

    try {
      const session: WatchPartySession = JSON.parse(sessionData);
      session.current_time = currentTime;
      session.is_playing = isPlaying;
      
      localStorage.setItem(this.getStorageKey(cleanSessionId), JSON.stringify(session));
    } catch (error) {
      console.error('Error updating playback state:', error);
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const cleanSessionId = sessionId.toUpperCase();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chatMessage: WatchPartyMessage = {
      id: messageId,
      session_id: cleanSessionId,
      user_id: user.id,
      username: user.email?.split('@')[0] || 'User',
      message,
      timestamp: new Date().toISOString()
    };

    try {
      const existingMessages = JSON.parse(localStorage.getItem(this.getChatKey(cleanSessionId)) || '[]');
      existingMessages.push(chatMessage);
      localStorage.setItem(this.getChatKey(cleanSessionId), JSON.stringify(existingMessages));
      console.log('Message sent to session:', cleanSessionId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async getMessages(sessionId: string): Promise<WatchPartyMessage[]> {
    const cleanSessionId = sessionId.toUpperCase();
    try {
      const messages = localStorage.getItem(this.getChatKey(cleanSessionId));
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  sessionExists(sessionId: string): boolean {
    const cleanSessionId = sessionId.trim().toUpperCase();
    const exists = localStorage.getItem(this.getStorageKey(cleanSessionId)) !== null;
    console.log(`Session ${cleanSessionId} exists: ${exists}`);
    return exists;
  }

  async getSession(sessionId: string): Promise<WatchPartySession | null> {
    const cleanSessionId = sessionId.toUpperCase();
    const sessionData = localStorage.getItem(this.getStorageKey(cleanSessionId));
    
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Error parsing session:', error);
      return null;
    }
  }
}

export const watchPartyService = new WatchPartyService();
