import React from 'react';
import { Github, Twitter, Youtube, Instagram, Heart } from 'lucide-react';
import { FlickPickLogo } from './FlickPickLogo';
import { useNavigate } from 'react-router-dom';

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background border-t border-border/50 py-12 md:py-16 pb-mobile-nav md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 text-center md:text-left">
            <FlickPickLogo className="mb-4 md:mb-6 mx-auto md:mx-0" />
            <p className="text-muted-foreground max-w-md leading-relaxed text-sm md:text-base mx-auto md:mx-0">
              Your ultimate destination for streaming movies and TV series. 
              Discover, watch, and enjoy unlimited entertainment with FlickPick's 
              curated collection of the best content from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-foreground font-semibold mb-4 md:mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/browse')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Browse
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/trending')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Trending
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/top-rated')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Top Rated
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/history')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Watch History
                </button>
              </li>
            </ul>
          </div>

          {/* Support/Donate */}
          <div className="text-center md:text-left">
            <h3 className="text-foreground font-semibold mb-4 md:mb-6 text-lg">Support</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/support')} 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm md:text-base touch-target mx-auto md:mx-0"
                >
                  <Heart className="h-4 w-4" />
                  Donate to FlickPick
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/help')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/privacy')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/terms')} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base touch-target"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-xs md:text-sm text-center md:text-left">
            © 2025 FlickPick. Made with ❤️ by Gerald. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <a 
              href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" 
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent/50 touch-target"
              aria-label="Follow us on Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" 
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent/50 touch-target"
              aria-label="Subscribe to our YouTube channel"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a 
              href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" 
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent/50 touch-target"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://www.youtube.com/watch?v=6s0OVdoo4Q4" 
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent/50 touch-target"
              aria-label="View our GitHub repository"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
