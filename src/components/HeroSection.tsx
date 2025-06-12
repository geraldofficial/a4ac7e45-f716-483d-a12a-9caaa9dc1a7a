
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          Discover Your Next
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Favorite Story
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in">
          Stream millions of movies and TV series in stunning quality. Your entertainment journey starts here.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
            <Play className="mr-2 h-5 w-5" />
            Start Watching
          </Button>
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
            <Plus className="mr-2 h-5 w-5" />
            My List
          </Button>
        </div>
      </div>
    </section>
  );
};
