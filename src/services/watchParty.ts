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
  last_activity: string;
}

export interface WatchPartyParticipant {
  user_id: string;
  username: string;
  avatar: string;
  joined_at: string;
  is_active: boolean;
}

export interface WatchPartyMessage {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'sync';
}

class WatchPartyService {
  private syncInterval?: NodeJS.Timeout;
  private currentSessionId?: string;
  private listeners: Map<string, (session: WatchPartySession) => void> = new Map();

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
      session.last_activity = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(session));
      
      // Update global sessions list
      const allSessions = this.getAllSessions();
      if (!allSessions.includes(sessionId)) {
        allSessions.push(sessionId);
        localStorage.setItem('watchPartySessions', JSON.stringify(allSessions));
      }
      
      // Notify listeners
      this.notifyListeners(sessionId, session);
      
      console.log(`Session saved: ${sessionId}`, session);
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session data');
    }
  }

  private getAllSessions(): string[] {
    try {
      return JSON.parse(localStorage.getItem('watchPartySessions') || '[]');
    } catch {
      return [];
    }
  }

  private notifyListeners(sessionId: string, session: WatchPartySession): void {
    this.listeners.forEach((callback) => {
      try {
        callback(session);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  async createSession(movieId: number, movieTitle: string, movieType: 'movie' | 'tv'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const sessionId = this.generateSessionId();
    
    // Check if session ID already exists (extremely rare but possible)
    let attempts = 0;
    while (this.sessionExists(sessionId) && attempts < 5) {
      const newSessionId = this.generateSessionId();
      attempts++;
      if (attempts >= 5) {
        throw new Error('Failed to generate unique session ID');
      }
    }
    
    const session: WatchPartySession = {
      id: sessionId,
      host_id: user.id,
      movie_id: movieId,
      movie_title: movieTitle,
      movie_type: movieType,
      current_time: 0,
      is_playing: false,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      participants: [{
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Host',
        avatar: '👤',
        joined_at: new Date().toISOString(),
        is_active: true
      }]
    };

    this.setSessionData(sessionId, session);
    
    // Initialize empty chat with welcome message
    const welcomeMessage: WatchPartyMessage = {
      id: `system_${Date.now()}`,
      session_id: sessionId,
      user_id: 'system',
      username: 'FlickPick',
      message: `Welcome to the watch party for "${movieTitle}"! Share the code ${sessionId} with friends to join.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    localStorage.setItem(this.getChatKey(sessionId), JSON.stringify([welcomeMessage]));
    
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

      // Check if session is too old (24 hours)
      const sessionAge = Date.now() - new Date(session.created_at).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        console.log(`Session expired: ${cleanSessionId}`);
        this.cleanupSession(cleanSessionId);
        return null;
      }
      
      // Check if user is already a participant
      const existingParticipant = session.participants.find(p => p.user_id === user.id);
      if (!existingParticipant) {
        session.participants.push({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar: '👤',
          joined_at: new Date().toISOString(),
          is_active: true
        });
        
        // Add join message to chat
        const joinMessage: WatchPartyMessage = {
          id: `system_${Date.now()}`,
          session_id: cleanSessionId,
          user_id: 'system',
          username: 'FlickPick',
          message: `${user.email?.split('@')[0] || 'User'} joined the party!`,
          timestamp: new Date().toISOString(),
          type: 'system'
        };
        
        const existingMessages = await this.getMessages(cleanSessionId);
        existingMessages.push(joinMessage);
        localStorage.setItem(this.getChatKey(cleanSessionId), JSON.stringify(existingMessages));
        
        this.setSessionData(cleanSessionId, session);
        console.log(`User joined session: ${cleanSessionId}`);
      } else {
        // Mark existing participant as active
        existingParticipant.is_active = true;
        this.setSessionData(cleanSessionId, session);
      }

      return session;
    } catch (error) {
      console.error('Error joining session:', error);
      throw new Error('Failed to join watch party session');
    }
  }

  async updatePlaybackState(sessionId: string, currentTime: number, isPlaying: boolean): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Only host can update playback state
    if (session.host_id !== user.id) {
      console.warn('Only host can update playback state');
      return;
    }

    session.current_time = currentTime;
    session.is_playing = isPlaying;
    
    this.setSessionData(sessionId, session);

    // Add sync message to chat if significant change
    const timeDiff = Math.abs(currentTime - session.current_time);
    if (timeDiff > 5 || session.is_playing !== isPlaying) {
      const syncMessage: WatchPartyMessage = {
        id: `sync_${Date.now()}`,
        session_id: sessionId.toUpperCase(),
        user_id: 'system',
        username: 'FlickPick',
        message: isPlaying ? 'Playback resumed' : 'Playback paused',
        timestamp: new Date().toISOString(),
        type: 'sync'
      };

      const existingMessages = await this.getMessages(sessionId);
      existingMessages.push(syncMessage);
      localStorage.setItem(this.getChatKey(sessionId), JSON.stringify(existingMessages));
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    if (!message.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const cleanSessionId = sessionId.toUpperCase();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chatMessage: WatchPartyMessage = {
      id: messageId,
      session_id: cleanSessionId,
      user_id: user.id,
      username: user.email?.split('@')[0] || 'User',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    try {
      const existingMessages = await this.getMessages(cleanSessionId);
      existingMessages.push(chatMessage);
      
      // Keep only last 100 messages to prevent storage bloat
      if (existingMessages.length > 100) {
        existingMessages.splice(0, existingMessages.length - 100);
      }
      
      localStorage.setItem(this.getChatKey(cleanSessionId), JSON.stringify(existingMessages));
      console.log('Message sent to session:', cleanSessionId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
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
    
    if (exists) {
      // Check if session is expired
      try {
        const session = JSON.parse(sessionData);
        const sessionAge = Date.now() - new Date(session.created_at).getTime();
        if (sessionAge > 24 * 60 * 60 * 1000) {
          this.cleanupSession(cleanSessionId);
          return false;
        }
      } catch (error) {
        this.cleanupSession(cleanSessionId);
        return false;
      }
    }
    
    console.log(`Session ${cleanSessionId} exists: ${exists}`);
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
      
      // Check if session is expired
      const sessionAge = Date.now() - new Date(session.created_at).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        console.log(`Session expired: ${cleanSessionId}`);
        this.cleanupSession(cleanSessionId);
        return null;
      }
      
      console.log(`Retrieved session: ${cleanSessionId}`, session);
      return session;
    } catch (error) {
      console.error('Error parsing session:', error);
      this.cleanupSession(cleanSessionId);
      return null;
    }
  }

  // Subscribe to session updates
  subscribeToSession(sessionId: string, callback: (session: WatchPartySession) => void): () => void {
    const key = `${sessionId}_${Date.now()}`;
    this.listeners.set(key, callback);
    
    return () => {
      this.listeners.delete(key);
    };
  }

  // Start real-time sync for a session
  startSync(sessionId: string): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.currentSessionId = sessionId;
    
    // Sync every 2 seconds
    this.syncInterval = setInterval(async () => {
      try {
        const session = await this.getSession(sessionId);
        if (session) {
          this.notifyListeners(sessionId, session);
        }
      } catch (error) {
        console.error('Error during sync:', error);
      }
    }, 2000);
  }

  // Stop real-time sync
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    this.currentSessionId = undefined;
    this.listeners.clear();
  }

  private cleanupSession(sessionId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(sessionId));
      localStorage.removeItem(this.getChatKey(sessionId));
      
      const allSessions = this.getAllSessions();
      const updatedSessions = allSessions.filter(id => id !== sessionId);
      localStorage.setItem('watchPartySessions', JSON.stringify(updatedSessions));
      
      console.log(`Cleaned up session: ${sessionId}`);
    } catch (error) {
      console.error('Error cleaning up session:', error);
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
              this.cleanupSession(sessionId);
            }
          } catch (error) {
            this.cleanupSession(sessionId);
          }
        }
      });

      localStorage.setItem('watchPartySessions', JSON.stringify(validSessions));
      console.log(`Cleaned up ${allSessions.length - validSessions.length} expired sessions`);
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }
}

export const watchPartyService = new WatchPartyService();

// Clean up old sessions on service initialization
watchPartyService.cleanupOldSessions();
