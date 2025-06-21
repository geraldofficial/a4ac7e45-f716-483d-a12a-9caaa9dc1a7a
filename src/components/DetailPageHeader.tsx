import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import { Star, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { Movie } from "@/services/tmdb";

interface DetailPageHeaderProps {
  content: Movie;
  type: string;
  season?: number;
  episode?: number;
  shouldResume: boolean;
  trailer: any;
  onBack: () => void;
}

export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
  content,
  type,
  season,
  episode,
  shouldResume,
  trailer,
  onBack,
}) => {
  const [showVideo, setShowVideo] = useState(true);
  const title = content.title || content.name || "Unknown Title";
  const releaseDate = content.release_date || content.first_air_date || "";
  const backdropUrl = content.backdrop_path
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : "https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop";

  const getDisplayTitle = () => {
    if (type === "tv" && season && episode) {
      return `${title} - Season ${season} Episode ${episode}`;
    }
    return title;
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  return (
    <div className="relative h-[60vh] md:h-screen">
      {trailer && showVideo ? (
        <TrailerPlayer
          videoKey={trailer.key}
          title={title}
          backdropPath={content.backdrop_path}
          onClose={handleCloseVideo}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 container mx-auto px-3 md:px-4 pb-4 md:pb-8">
        <div className="max-w-full md:max-w-2xl">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-foreground mb-2 md:mb-4 hover:bg-accent p-1 md:p-2"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Back</span>
          </Button>

          <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-6 leading-tight drop-shadow-lg">
            {getDisplayTitle()}
          </h1>

          {type === "tv" && season && episode && (
            <div className="mb-3 md:mb-4">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                S{season}E{episode}
              </span>
              {shouldResume && (
                <span className="ml-2 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  Continue Watching
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-6 text-white mb-2 md:mb-6 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 md:h-5 md:w-5 text-yellow-400 fill-current" />
              <span className="text-sm md:text-lg font-semibold">
                {content.vote_average.toFixed(1)}
              </span>
            </div>

            {releaseDate && (
              <div className="flex items-center gap-1 md:gap-2">
                <Calendar className="h-3 w-3 md:h-5 md:w-5" />
                <span className="text-xs md:text-base">
                  {new Date(releaseDate).getFullYear()}
                </span>
              </div>
            )}

            {content.runtime && (
              <div className="flex items-center gap-1 md:gap-2">
                <Clock className="h-3 w-3 md:h-5 md:w-5" />
                <span className="text-xs md:text-base">
                  {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                </span>
              </div>
            )}

            {content.number_of_seasons && (
              <div className="flex items-center gap-1 md:gap-2">
                <Users className="h-3 w-3 md:h-5 md:w-5" />
                <span className="text-xs md:text-base">
                  {content.number_of_seasons} Season
                  {content.number_of_seasons > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          <p className="text-white/90 text-xs md:text-lg leading-relaxed mb-4 md:mb-6 max-w-full md:max-w-xl drop-shadow">
            {content.overview}
          </p>
        </div>
      </div>
    </div>
  );
};
