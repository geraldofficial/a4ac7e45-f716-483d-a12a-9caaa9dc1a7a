
import React, { useState } from 'react';
import { Menu, X, User, LogOut, Bookmark, Home, Search, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchSuggestions } from './SearchSuggestions';
import { FlickPickLogo } from './FlickPickLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-4 left-4 right-4 z-50">
        <div className="bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button 
                onClick={() => navigate('/')} 
                className="hover:scale-105 transition-transform duration-200"
              >
                <FlickPickLogo />
              </button>

              {/* Desktop Navigation */}
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => navigate('/')} 
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate('/browse')} 
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Browse
                </button>
                {user && (
                  <button 
                    onClick={() => navigate('/watchlist')} 
                    className="text-foreground hover:text-primary transition-colors font-medium"
                  >
                    My List
                  </button>
                )}
              </div>

              {/* Search and User Menu */}
              <div className="flex items-center space-x-4">
                {/* Desktop Search */}
                <SearchSuggestions className="w-64" />
                
                {/* User Menu */}
                {loading ? (
                  <div className="text-muted-foreground text-sm">Loading...</div>
                ) : user ? (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/watchlist')}
                      className="text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                    >
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2 text-foreground">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <span className="text-sm font-medium">{user.username}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-foreground hover:text-primary"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => navigate('/auth')}
                    className="rounded-xl"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
          <div className="flex items-center justify-around py-3 px-2">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-center space-y-1 p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <Home className="h-5 w-5 text-foreground" />
              <span className="text-xs text-foreground">Home</span>
            </button>
            
            <button
              onClick={() => navigate('/browse')}
              className="flex flex-col items-center space-y-1 p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <Film className="h-5 w-5 text-foreground" />
              <span className="text-xs text-foreground">Browse</span>
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center space-y-1 p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <Search className="h-5 w-5 text-foreground" />
              <span className="text-xs text-foreground">Search</span>
            </button>
            
            {user ? (
              <>
                <button
                  onClick={() => navigate('/watchlist')}
                  className="flex flex-col items-center space-y-1 p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <Bookmark className="h-5 w-5 text-foreground" />
                  <span className="text-xs text-foreground">List</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center space-y-1 p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {user.avatar}
                  </div>
                  <span className="text-xs text-foreground">Exit</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="flex flex-col items-center space-y-1 p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <User className="h-5 w-5 text-foreground" />
                <span className="text-xs text-foreground">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-40">
            <div className="p-4 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Search Movies</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent"
                >
                  <X className="h-6 w-6 text-foreground" />
                </button>
              </div>
              <SearchSuggestions onClose={() => setIsMenuOpen(false)} />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
