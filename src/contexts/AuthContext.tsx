
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  watchlist: number[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('lickpick_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple authentication - in production, you'd validate against a real backend
    const storedUsers = JSON.parse(localStorage.getItem('lickpick_users') || '{}');
    const userData = storedUsers[username];
    
    if (userData && userData.password === password) {
      const userSession = {
        id: userData.id,
        username,
        watchlist: userData.watchlist || []
      };
      setUser(userSession);
      localStorage.setItem('lickpick_user', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem('lickpick_users') || '{}');
    
    if (storedUsers[username]) {
      return false; // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      password,
      watchlist: []
    };

    storedUsers[username] = newUser;
    localStorage.setItem('lickpick_users', JSON.stringify(storedUsers));

    const userSession = {
      id: newUser.id,
      username,
      watchlist: []
    };
    setUser(userSession);
    localStorage.setItem('lickpick_user', JSON.stringify(userSession));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lickpick_user');
  };

  const addToWatchlist = (movieId: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      watchlist: [...user.watchlist, movieId]
    };
    setUser(updatedUser);
    localStorage.setItem('lickpick_user', JSON.stringify(updatedUser));
    
    // Update stored users
    const storedUsers = JSON.parse(localStorage.getItem('lickpick_users') || '{}');
    if (storedUsers[user.username]) {
      storedUsers[user.username].watchlist = updatedUser.watchlist;
      localStorage.setItem('lickpick_users', JSON.stringify(storedUsers));
    }
  };

  const removeFromWatchlist = (movieId: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      watchlist: user.watchlist.filter(id => id !== movieId)
    };
    setUser(updatedUser);
    localStorage.setItem('lickpick_user', JSON.stringify(updatedUser));
    
    // Update stored users
    const storedUsers = JSON.parse(localStorage.getItem('lickpick_users') || '{}');
    if (storedUsers[user.username]) {
      storedUsers[user.username].watchlist = updatedUser.watchlist;
      localStorage.setItem('lickpick_users', JSON.stringify(storedUsers));
    }
  };

  const isInWatchlist = (movieId: number) => {
    return user ? user.watchlist.includes(movieId) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};
