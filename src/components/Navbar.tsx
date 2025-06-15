
import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User, LogOut, Home, TrendingUp, Grid3X3, Star, Clock, UserCircle, Settings, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { FlickPickLogo } from './FlickPickLogo';
import { ProfileSelector } from './ProfileSelector';
import { NotificationCenter } from './NotificationCenter';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, currentProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Browse', href: '/browse', icon: Grid3X3, current: location.pathname === '/browse' },
    { name: 'Trending', href: '/trending', icon: TrendingUp, current: location.pathname === '/trending' },
    { name: 'Top Rated', href: '/top-rated', icon: Star, current: location.pathname === '/top-rated' },
  ];

  const userNavigation = user ? [
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Watchlist', href: '/watchlist', icon: Clock },
    { name: 'Watch History', href: '/history', icon: Clock },
  ] : [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled || isMenuOpen 
        ? 'bg-background/95 backdrop-blur-sm border-b border-border/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FlickPickLogo className="h-6 w-6 md:h-8 md:w-8" />
              <span className="font-bold text-base md:text-xl text-foreground">FlickPick</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background"
                />
              </div>
            </form>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user && <NotificationCenter />}
            {user ? (
              <div className="flex items-center space-x-3">
                <ProfileSelector />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationCenter />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Search Bar - Mobile */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Navigation Items */}
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ))}

              {/* User Navigation */}
              {user && (
                <>
                  <div className="border-t border-border/30 my-2"></div>
                  <div className="px-3 py-2">
                    <ProfileSelector />
                  </div>
                  {userNavigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}

              {/* Sign In Button for Mobile */}
              {!user && (
                <Button
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-3"
                >
                  <User className="h-4 w-4 mr-2" />
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
