
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoPlayer } from './VideoPlayer';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface MovieCardProps {
  movie: Movie;
  type: 'movie' | 'tv';
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, type }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const posterUrl = movie.poster_path.startsWith('http') 
    ? movie.poster_path 
    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  const handleWatch = () => {
    setIsPlaying(true);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-300 text-sm">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Play className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">{movie.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {isPlaying ? (
                        <VideoPlayer 
                          title={movie.title}
                          tmdbId={movie.id}
                          type={type}
                        />
                      ) : (
                        <div>
                          <p className="text-gray-300 mb-4">{movie.overview}</p>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                            </div>
                            <span className="text-gray-300">
                              {new Date(movie.release_date).getFullYear()}
                            </span>
                          </div>
                          <Button onClick={handleWatch} className="bg-purple-600 hover:bg-purple-700">
                            <Play className="h-4 w-4 mr-2" />
                            Start Watching
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-white font-semibold truncate">{movie.title}</h3>
          <p className="text-gray-400 text-sm">
            {new Date(movie.release_date).getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
};
