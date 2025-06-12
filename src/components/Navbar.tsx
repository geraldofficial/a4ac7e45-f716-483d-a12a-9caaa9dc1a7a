import React, { useState } from 'react';
import { Menu, X, User, LogOut, Bookmark } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')} 
            className="hover:scale-105 transition-transform duration-200"
          >
            <FlickPickLogo />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
            <SearchSuggestions className="hidden md:block w-64" />
            
            {/* User Menu */}
            {loading ? (
              <div className="hidden md:block text-muted-foreground text-sm">Loading...</div>
            ) : user ? (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => navigate('/watchlist')}
                  className="text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-2 text-foreground">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
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
                className="hidden md:block"
              >
                Sign In
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50">
            <div className="flex flex-col space-y-4 pt-4">
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="text-foreground hover:text-primary transition-colors text-left">Home</button>
              <button onClick={() => { navigate('/browse'); setIsMenuOpen(false); }} className="text-foreground hover:text-primary transition-colors text-left">Browse</button>
              {user && (
                <button onClick={() => { navigate('/watchlist'); setIsMenuOpen(false); }} className="text-foreground hover:text-primary transition-colors text-left">My List</button>
              )}
              
              {/* Mobile Search */}
              <SearchSuggestions onClose={() => setIsMenuOpen(false)} />
              
              {/* Mobile User Menu */}
              {loading ? (
                <div className="text-foreground text-sm">Loading...</div>
              ) : user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center space-x-2 text-foreground">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-foreground hover:text-primary justify-start px-0"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
