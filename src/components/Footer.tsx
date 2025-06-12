
import React from 'react';
import { Film, Github, Twitter, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black/80 border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Film className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">LickPick</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Your ultimate destination for streaming movies and TV series. 
              Discover, watch, and enjoy unlimited entertainment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Movies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">TV Series</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Trending</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 LickPick. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
