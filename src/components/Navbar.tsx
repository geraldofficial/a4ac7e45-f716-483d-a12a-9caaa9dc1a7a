
import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { FlickPickLogo } from './FlickPickLogo';
import { ProfileDisplay } from './ProfileDisplay';
import { NotificationCenter } from './NotificationCenter';
import { NavigationDrawer } from './NavigationDrawer';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Browse', href: '/browse', current: location.pathname === '/browse' },
    { name: 'Trending', href: '/trending', current: location.pathname === '/trending' },
    { name: 'Top Rated', href: '/top-rated', current: location.pathname === '/top-rated' },
    { name: 'Community', href: '/community', current: location.pathname === '/community' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
      isScrolled 
        ? 'bg-black/95 backdrop-blur-sm border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FlickPickLogo 
                size="md" 
                showIcon={true} 
                showText={true} 
                responsive={true}
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:bg-black/80 focus:border-white/40"
                />
              </div>
            </form>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationCenter />}
            {user ? (
              <ProfileDisplay />
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sign In
              </Button>
            )}
            <NavigationDrawer />
          </div>

          {/* Mobile Right Side */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationCenter />}
            <NavigationDrawer />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search movies, TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/60 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};
