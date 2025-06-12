
import React, { useState } from 'react';
import { Search, Menu, X, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">LickPick</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-purple-400 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-purple-400 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-purple-400 transition-colors">TV Series</a>
            <a href="#" className="text-white hover:text-purple-400 transition-colors">Trending</a>
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search movies, TV shows..." 
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <div className="flex flex-col space-y-4 pt-4">
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Home</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Movies</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">TV Series</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Trending</a>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
