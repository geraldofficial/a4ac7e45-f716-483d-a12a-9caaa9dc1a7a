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
      return `${title} - S${season}E${episode}`;
    }
    return title;
  };

  return (
    <div className="relative h-[50vh] md:h-[70vh]">
      {trailer && showVideo ? (
        <TrailerPlayer
          videoKey={trailer.key}
          title={title}
          backdropPath={content.backdrop_path}
          onClose={() => setShowVideo(false)}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 container mx-auto px-4 pb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-foreground mb-2 hover:bg-accent/50 h-8 px-2"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Back</span>
        </Button>

        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 leading-tight">
          {getDisplayTitle()}
        </h1>

        {type === "tv" && season && episode && (
          <div className="flex gap-2 mb-2">
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
              S{season}E{episode}
            </span>
            {shouldResume && (
              <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full text-xs">
                Continue
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-foreground mb-2 flex-wrap text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-semibold">{content.vote_average.toFixed(1)}</span>
          </div>

          {releaseDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(releaseDate).getFullYear()}</span>
            </div>
          )}

          {content.runtime && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>
            </div>
          )}

          {content.number_of_seasons && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{content.number_of_seasons} Season{content.number_of_seasons > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl">
          {content.overview}
        </p>
      </div>
    </div>
  );
};
