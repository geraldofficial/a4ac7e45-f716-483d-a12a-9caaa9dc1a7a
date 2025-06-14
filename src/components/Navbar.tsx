
import React, { useState, useRef } from 'react';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FlickPickLogo } from './FlickPickLogo';
import { SearchSuggestions } from './SearchSuggestions';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-navbar bg-background/95 backdrop-blur-3xl border-b border-border/50" style={{ pointerEvents: 'auto' }}>
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div onClick={handleLogoClick} className="cursor-pointer" style={{ touchAction: 'manipulation' }}>
              <FlickPickLogo />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="text-foreground hover:text-primary transition-colors font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/browse')}
              className="text-foreground hover:text-primary transition-colors font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              Browse
            </button>
            <button 
              onClick={() => navigate('/trending')}
              className="text-foreground hover:text-primary transition-colors font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              Trending
            </button>
            <button 
              onClick={() => navigate('/top-rated')}
              className="text-foreground hover:text-primary transition-colors font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              Top Rated
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="text-foreground hover:text-primary transition-colors font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              Donate
            </button>
            {user && (
              <button 
                onClick={() => navigate('/history')}
                className="text-foreground hover:text-primary transition-colors font-medium"
                style={{ touchAction: 'manipulation' }}
              >
                History
              </button>
            )}
          </div>

          {/* Search & User Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 bg-background/60 backdrop-blur-xl border border-border/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    style={{ touchAction: 'manipulation', fontSize: '16px' }}
                  />
                </div>
              </form>
              {searchQuery && (
                <SearchSuggestions
                  query={searchQuery}
                  onSelect={(item) => {
                    navigate(`/${item.media_type}/${item.id}`);
                    setSearchQuery('');
                  }}
                  onClose={() => setSearchQuery('')}
                />
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 hover:bg-background/60"
              style={{ touchAction: 'manipulation' }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" style={{ touchAction: 'manipulation' }}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.avatar || user.avatar_url || user.image} 
                        alt={user.name || user.username || 'User'} 
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <AvatarFallback>
                        {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-3xl border-border/50" align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/watchlist')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="bg-background/50 backdrop-blur-xl border border-border/50 hover:bg-background/70"
                  style={{ touchAction: 'manipulation' }}
                >
                  Sign In
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-background/60"
              style={{ touchAction: 'manipulation' }}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4" style={{ touchAction: 'manipulation' }}>
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => { navigate('/browse'); setIsMenuOpen(false); }}
                className="text-left text-foreground hover:text-primary transition-colors font-medium"
                style={{ touchAction: 'manipulation' }}
              >
                Browse
              </button>
              
              {!user && (
                <div className="pt-2 border-t border-border/50">
                  <Button
                    onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                    className="w-full"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-background/95 backdrop-blur-3xl z-50 flex flex-col"
            style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground">Search</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="p-2"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 flex-1" style={{ touchAction: 'pan-y' }}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background/60 backdrop-blur-xl border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    style={{ touchAction: 'manipulation', fontSize: '16px' }}
                    autoFocus
                  />
                </div>
              </form>
              {searchQuery && (
                <SearchSuggestions
                  query={searchQuery}
                  onSelect={(item) => {
                    navigate(`/${item.media_type}/${item.id}`);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  onClose={() => setSearchQuery('')}
                  isMobile={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
