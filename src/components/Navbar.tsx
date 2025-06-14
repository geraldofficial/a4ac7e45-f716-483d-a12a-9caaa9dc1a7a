import React, { useState } from 'react';
import { MagnifyingGlass, Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FlickPickLogo } from './FlickPickLogo';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-3xl border-b border-border/50">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <FlickPickLogo onClick={() => navigate('/')} className="cursor-pointer" />
          </div>

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
            <button 
              onClick={() => navigate('/trending')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Trending
            </button>
            <button 
              onClick={() => navigate('/top-rated')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Top Rated
            </button>
            {user && (
              <button 
                onClick={() => navigate('/history')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                History
              </button>
            )}
          </div>

          {/* Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden text-foreground hover:bg-accent p-1"
            >
              <MagnifyingGlass className="h-4 w-4" />
            </Button>

            {/* User Menu / Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name || "Avatar"} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/watchlist')}>
                    Watchlist
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate('/history')}>
                    History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-foreground hover:bg-accent p-1"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left text-foreground hover:text-primary transition-colors font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => { navigate('/browse'); setIsMenuOpen(false); }}
                className="text-left text-foreground hover:text-primary transition-colors font-medium"
              >
                Browse
              </button>
              <button 
                onClick={() => { navigate('/trending'); setIsMenuOpen(false); }}
                className="text-left text-foreground hover:text-primary transition-colors font-medium"
              >
                Trending
              </button>
              <button 
                onClick={() => { navigate('/top-rated'); setIsMenuOpen(false); }}
                className="text-left text-foreground hover:text-primary transition-colors font-medium"
              >
                Top Rated
              </button>
              {user && (
                <button 
                  onClick={() => { navigate('/history'); setIsMenuOpen(false); }}
                  className="text-left text-foreground hover:text-primary transition-colors font-medium"
                >
                  History
                </button>
              )}
              
              {/* Mobile Auth Buttons */}
              {!user && (
                <>
                  <Button variant="outline" size="sm" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-background/95 backdrop-blur-3xl z-50 flex items-center justify-center">
            <div className="relative w-full max-w-md px-4">
              <Input
                placeholder="Search for movies or TV shows..."
                className="rounded-full shadow-md"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-foreground hover:bg-accent p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
