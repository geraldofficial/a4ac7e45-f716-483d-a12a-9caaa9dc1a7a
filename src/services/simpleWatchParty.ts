// Simple in-memory watch party service for demo purposes
// This doesn't require complex database setup and works immediately

interface SimpleWatchPartySession {
  id: string;
  movieId: number;
  movieTitle: string;
  movieType: "movie" | "tv";
  hostId: string;
  participants: string[];
  createdAt: Date;
  isActive: boolean;
}

class SimpleWatchPartyService {
  private sessions: Map<string, SimpleWatchPartySession> = new Map();

  // Generate a simple 6-character code
  generatePartyCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new watch party
  createSession(
    movieId: number,
    movieTitle: string,
    movieType: "movie" | "tv",
    hostId: string,
  ): string {
    let sessionId = this.generatePartyCode();

    // Ensure unique ID
    while (this.sessions.has(sessionId)) {
      sessionId = this.generatePartyCode();
    }

    const session: SimpleWatchPartySession = {
      id: sessionId,
      movieId,
      movieTitle,
      movieType,
      hostId,
      participants: [hostId],
      createdAt: new Date(),
      isActive: true,
    };

    this.sessions.set(sessionId, session);

    // Auto-cleanup after 24 hours
    setTimeout(
      () => {
        this.sessions.delete(sessionId);
      },
      24 * 60 * 60 * 1000,
    );

    return sessionId;
  }

  // Join an existing session
  joinSession(
    sessionId: string,
    userId: string,
  ): SimpleWatchPartySession | null {
    const session = this.sessions.get(sessionId.toUpperCase());

    if (!session || !session.isActive) {
      return null;
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
    }

    return session;
  }

  // Get session details
  getSession(sessionId: string): SimpleWatchPartySession | null {
    return this.sessions.get(sessionId.toUpperCase()) || null;
  }

  // Check if session exists
  sessionExists(sessionId: string): boolean {
    const session = this.sessions.get(sessionId.toUpperCase());
    return !!(session && session.isActive);
  }

  // Leave session
  leaveSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId.toUpperCase());

    if (!session) return false;

    session.participants = session.participants.filter((id) => id !== userId);

    // If host leaves or no participants left, deactivate session
    if (session.hostId === userId || session.participants.length === 0) {
      session.isActive = false;
    }

    return true;
  }

  // Get active sessions count (for debugging)
  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter((s) => s.isActive).length;
  }

  // Get session info for debugging
  getAllSessions(): SimpleWatchPartySession[] {
    return Array.from(this.sessions.values());
  }
}

export const simpleWatchPartyService = new SimpleWatchPartyService();
export type { SimpleWatchPartySession };
