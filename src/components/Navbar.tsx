
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Settings, Bookmark, Heart, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { FlickPickLogo } from './FlickPickLogo';
import { SearchSuggestions } from './SearchSuggestions';

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Haptic feedback function
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    triggerHaptic();
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { label: 'Browse', path: '/browse', icon: Menu },
    { label: 'Trending', path: '/trending', icon: TrendingUp },
    { label: 'Top Rated', path: '/top-rated', icon: Star },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:flex fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl border backdrop-blur-xl ${
        isScrolled ? 'bg-background/95 border-border/50 shadow-lg' : 'bg-background/80 border-border/30'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <FlickPickLogo />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-foreground hover:text-primary transition-colors font-medium ${
                    location.pathname === item.path ? 'text-primary' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, TV shows..."
                  className="bg-accent/50 border border-border rounded-full px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder-muted-foreground"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </form>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.username || 'User'} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg py-1 z-50 backdrop-blur-xl">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{user.username || 'User'}</p>
                      </div>
                      <Link
                        to="/watchlist"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors rounded-lg mx-1"
                        onClick={() => {
                          triggerHaptic();
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        Watchlist
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors rounded-lg mx-1"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button asChild className="rounded-full">
                  <Link to="/auth" onClick={triggerHaptic}>Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-2 left-2 right-2 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg">
        <div className="px-3">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center" onClick={triggerHaptic}>
              <FlickPickLogo showIcon={true} size="sm" />
            </Link>

            <div className="flex items-center space-x-3 flex-1 justify-end">
              <div className="flex-1 max-w-[200px]">
                <SearchSuggestions className="w-full" />
              </div>

              {user ? (
                <Link to="/watchlist" onClick={triggerHaptic} className="flex items-center justify-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.username || 'User'} />
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Button asChild size="sm" className="rounded-full h-8 px-3 text-xs min-w-[60px]">
                  <Link to="/auth" onClick={triggerHaptic}>Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile - Enhanced touch targets */}
      <nav className="md:hidden fixed bottom-2 left-2 right-2 z-40 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[60px] min-h-[50px] ${
                location.pathname === item.path 
                  ? 'text-primary bg-primary/10 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          {user && (
            <Link
              to="/watchlist"
              onClick={triggerHaptic}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[60px] min-h-[50px] ${
                location.pathname === '/watchlist'
                  ? 'text-primary bg-primary/10 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Bookmark className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Watchlist</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};
