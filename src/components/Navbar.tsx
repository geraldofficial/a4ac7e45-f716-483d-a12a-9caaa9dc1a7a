
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Menu, 
  X, 
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { FlickPickLogo } from './FlickPickLogo';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSwitcher } from './ProfileSwitcher';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Browse', href: '/browse' },
    { name: 'Trending', href: '/trending' },
    { name: 'Top Rated', href: '/top-rated' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FlickPickLogo className="h-8 w-8 md:h-10 md:w-10" />
            <span className="text-xl md:text-2xl font-bold text-foreground">FlickPick</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/search')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <ProfileSwitcher />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileClick}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/20 bg-background/95 backdrop-blur-lg">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-primary px-2 py-1 ${
                    location.pathname === item.href 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex items-center justify-between px-2 py-2 border-t border-border/20 mt-4 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/search');
                    setIsMenuOpen(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>

                {user ? (
                  <div className="flex items-center space-x-2">
                    <ProfileSwitcher />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleProfileClick}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }} 
                    size="sm"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
