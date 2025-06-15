
import React from 'react';
import { Github, Twitter, Youtube, Instagram, Heart } from 'lucide-react';
import { FlickPickLogo } from './FlickPickLogo';
import { useNavigate } from 'react-router-dom';

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background border-t border-border/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <FlickPickLogo className="mb-6" />
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Your ultimate destination for streaming movies and TV series. 
              Discover, watch, and enjoy unlimited entertainment with FlickPick's 
              curated collection of the best content from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/browse')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/trending')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Trending
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/top-rated')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Top Rated
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/history')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Watch History
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground font-semibold mb-6 text-lg">Support</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/donate')} 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Support Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/help')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/privacy')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/terms')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            © 2025 FlickPick. made by Gerald all rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" className="text-muted-foreground hover:text-primary transition-colors">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
