
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User, LogOut, Settings, Heart } from 'lucide-react';
import { FlickPickLogo } from './FlickPickLogo';
import { useAuth } from '@/contexts/AuthContext';
import { SearchSuggestions } from './SearchSuggestions';
import { ProfileSwitcher } from './ProfileSwitcher';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <FlickPickLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link 
              to="/" 
              className={`text-sm lg:text-base font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              className={`text-sm lg:text-base font-medium transition-colors hover:text-primary ${
                isActive('/browse') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Browse
            </Link>
            <Link 
              to="/trending" 
              className={`text-sm lg:text-base font-medium transition-colors hover:text-primary ${
                isActive('/trending') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Trending
            </Link>
            <Link 
              to="/donate" 
              className={`text-sm lg:text-base font-medium transition-colors hover:text-primary ${
                isActive('/donate') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Donate
            </Link>
            {user && (
              <Link 
                to="/watchlist" 
                className={`text-sm lg:text-base font-medium transition-colors hover:text-primary ${
                  isActive('/watchlist') ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                Watchlist
              </Link>
            )}
          </div>

          {/* Search and Profile */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 p-4">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Search Movies & TV Shows</h2>
                      <Button variant="ghost" size="sm" onClick={closeSearch}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <SearchSuggestions onClose={closeSearch} className="w-full" />
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSearch}
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Profile/Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <ProfileSwitcher />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username || 'User'} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.username || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/watchlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Watchlist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profiles')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Manage Profiles</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-sm"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 ${
                  isActive('/') ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 ${
                  isActive('/browse') ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                to="/trending" 
                className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 ${
                  isActive('/trending') ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Trending
              </Link>
              <Link 
                to="/donate" 
                className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 ${
                  isActive('/donate') ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Donate
              </Link>
              {user && (
                <Link 
                  to="/watchlist" 
                  className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 ${
                    isActive('/watchlist') ? 'text-primary' : 'text-foreground/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Watchlist
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
