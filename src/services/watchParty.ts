
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

  private setSessionData(sessionId: string, session: WatchPartySession): void {
    try {
      const key = this.getStorageKey(sessionId);
      localStorage.setItem(key, JSON.stringify(session));
      
      // Also update global sessions list
      const allSessions = this.getAllSessions();
      if (!allSessions.includes(sessionId)) {
        allSessions.push(sessionId);
        localStorage.setItem('watchPartySessions', JSON.stringify(allSessions));
      }
      
      console.log(`Session saved: ${sessionId}`, session);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  private getAllSessions(): string[] {
    try {
      return JSON.parse(localStorage.getItem('watchPartySessions') || '[]');
    } catch {
      return [];
    }
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

    this.setSessionData(sessionId, session);
    
    // Initialize empty chat
    localStorage.setItem(this.getChatKey(sessionId), JSON.stringify([]));
    
    console.log(`Created watch party session: ${sessionId}`);
    return sessionId;
  }

  async joinSession(sessionId: string): Promise<WatchPartySession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const cleanSessionId = sessionId.trim().toUpperCase();
    console.log(`Attempting to join session: ${cleanSessionId}`);
    
    if (!this.sessionExists(cleanSessionId)) {
      console.log(`Session not found: ${cleanSessionId}`);
      return null;
    }

    try {
      const session = await this.getSession(cleanSessionId);
      if (!session) return null;
      
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
        this.setSessionData(cleanSessionId, session);
        console.log(`User joined session: ${cleanSessionId}`);
      }

      return session;
    } catch (error) {
      console.error('Error joining session:', error);
      return null;
    }
  }

  async updatePlaybackState(sessionId: string, currentTime: number, isPlaying: boolean): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.current_time = currentTime;
    session.is_playing = isPlaying;
    
    this.setSessionData(sessionId, session);
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
      const existingMessages = await this.getMessages(cleanSessionId);
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
    const sessionData = localStorage.getItem(this.getStorageKey(cleanSessionId));
    const exists = sessionData !== null;
    console.log(`Session ${cleanSessionId} exists: ${exists}`);
    
    // Also check if it's in the global sessions list
    if (exists) {
      const allSessions = this.getAllSessions();
      if (!allSessions.includes(cleanSessionId)) {
        // Add to global list if missing
        allSessions.push(cleanSessionId);
        localStorage.setItem('watchPartySessions', JSON.stringify(allSessions));
      }
    }
    
    return exists;
  }

  async getSession(sessionId: string): Promise<WatchPartySession | null> {
    const cleanSessionId = sessionId.toUpperCase();
    const sessionData = localStorage.getItem(this.getStorageKey(cleanSessionId));
    
    if (!sessionData) {
      console.log(`No session data found for: ${cleanSessionId}`);
      return null;
    }
    
    try {
      const session = JSON.parse(sessionData);
      console.log(`Retrieved session: ${cleanSessionId}`, session);
      return session;
    } catch (error) {
      console.error('Error parsing session:', error);
      return null;
    }
  }

  // Clean up old sessions (older than 24 hours)
  cleanupOldSessions(): void {
    try {
      const allSessions = this.getAllSessions();
      const now = new Date().getTime();
      const validSessions: string[] = [];

      allSessions.forEach(sessionId => {
        const sessionData = localStorage.getItem(this.getStorageKey(sessionId));
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            const createdAt = new Date(session.created_at).getTime();
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
              validSessions.push(sessionId);
            } else {
              // Remove old session
              localStorage.removeItem(this.getStorageKey(sessionId));
              localStorage.removeItem(this.getChatKey(sessionId));
            }
          } catch (error) {
            // Remove corrupted session
            localStorage.removeItem(this.getStorageKey(sessionId));
            localStorage.removeItem(this.getChatKey(sessionId));
          }
        }
      });

      localStorage.setItem('watchPartySessions', JSON.stringify(validSessions));
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }
}

export const watchPartyService = new WatchPartyService();

// Clean up old sessions on service initialization
watchPartyService.cleanupOldSessions();
