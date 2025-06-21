import React from "react";
import { Play, Plus, Heart, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTVGuest } from "@/contexts/TVGuestContext";

interface TVMovieCardProps {
  id: string;
  title: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  releaseDate?: string;
  rating?: number;
  genre?: string[];
  isMovie?: boolean;
  onClick?: () => void;
  onPlay?: () => void;
  onAddToWatchlist?: () => void;
  className?: string;
}

const TVMovieCard: React.FC<TVMovieCardProps> = ({
  id,
  title,
  poster,
  backdrop,
  overview,
  releaseDate,
  rating,
  genre = [],
  isMovie = true,
  onClick,
  onPlay,
  onAddToWatchlist,
  className = "",
}) => {
  const { isGuestMode, addToGuestWatchlist, guestWatchlist } = useTVGuest();
  const isInWatchlist = guestWatchlist.includes(id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    } else {
      // Default play action for guest mode
      window.open(`/watch/${id}?guest=true`, "_blank");
    }
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToWatchlist) {
      onAddToWatchlist();
    } else if (isGuestMode) {
      addToGuestWatchlist(id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default detail view for guest mode
      window.location.href = `/detail/${id}?guest=true`;
    }
  };

  const imageUrl = backdrop || poster || "/placeholder.svg";

  return (
    <div
      className={`tv-card group cursor-pointer ${className}`}
      onClick={handleCardClick}
      data-tv-focusable
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${isMovie ? "Movie" : "TV Show"}`}
    >
      {/* Card Image */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="tv-card-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              {/* Play Button */}
              <Button
                variant="secondary"
                size="lg"
                className="tv-button tv-button-primary"
                onClick={handlePlay}
                data-tv-focusable
              >
                <Play size={20} fill="currentColor" />
                <span className="ml-2">Play</span>
              </Button>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="lg"
                  className="tv-button tv-button-secondary"
                  onClick={handleAddToWatchlist}
                  data-tv-focusable
                  disabled={isInWatchlist}
                >
                  {isInWatchlist ? (
                    <Heart
                      size={20}
                      fill="currentColor"
                      className="text-red-500"
                    />
                  ) : (
                    <Plus size={20} />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="tv-button tv-button-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  data-tv-focusable
                >
                  <Info size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        {rating && (
          <Badge className="absolute top-3 right-3 bg-black/70 text-yellow-400 border-yellow-400">
            <Star size={14} fill="currentColor" />
            <span className="ml-1">{rating.toFixed(1)}</span>
          </Badge>
        )}
      </div>

      {/* Card Content */}
      <div className="tv-card-content">
        <h3 className="tv-card-title line-clamp-2">{title}</h3>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            {isMovie ? "Movie" : "TV Show"}
          </span>
          {releaseDate && (
            <span className="text-sm text-gray-400">
              {new Date(releaseDate).getFullYear()}
            </span>
          )}
        </div>

        {/* Genres */}
        {genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {genre.slice(0, 3).map((g, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {g}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {overview && (
          <p className="tv-card-description line-clamp-3 text-sm">{overview}</p>
        )}
      </div>
    </div>
  );
};

export default TVMovieCard;
