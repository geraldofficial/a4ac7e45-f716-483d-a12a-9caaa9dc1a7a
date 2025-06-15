import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/services/profiles';
import { toast } from 'sonner';

interface ContentRatingProps {
  tmdbId: number;
  contentType: 'movie' | 'tv';
  profileId?: string;
  title: string;
  compact?: boolean;
  className?: string;
}

export const ContentRating: React.FC<ContentRatingProps> = ({
  tmdbId,
  contentType,
  profileId,
  title,
  compact = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const queryClient = useQueryClient();

  // Get existing rating
  const { data: existingRating } = useQuery({
    queryKey: ['content-rating', profileId, tmdbId, contentType],
    queryFn: () => profileId ? profilesApi.getContentRating(profileId, tmdbId, contentType) : null,
    enabled: !!profileId
  });

  // Submit rating mutation
  const ratingMutation = useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error('No profile selected');
      return profilesApi.rateContent(profileId, tmdbId, contentType, selectedRating, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-rating', profileId, tmdbId, contentType] });
      setIsOpen(false);
      toast.success('Rating saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save rating: ' + error.message);
    }
  });

  const handleOpenDialog = () => {
    if (existingRating) {
      setSelectedRating(existingRating.rating);
      setReview(existingRating.review || '');
    } else {
      setSelectedRating(0);
      setReview('');
    }
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    ratingMutation.mutate();
  };

  const renderStars = (rating: number, interactive = false, size = 'sm') => {
    const starSize = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} cursor-pointer transition-colors ${
              star <= (interactive ? (hoveredRating || selectedRating) : rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setSelectedRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  if (compact && existingRating) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {renderStars(existingRating.rating)}
        <span className="text-sm text-muted-foreground">
          {existingRating.rating}/5
        </span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={existingRating ? "default" : "outline"}
          size="sm"
          onClick={handleOpenDialog}
          className={className}
        >
          <Star className="h-4 w-4 mr-2" />
          {existingRating ? (
            <>
              {existingRating.rating}/5
              {existingRating.review && <MessageSquare className="h-3 w-3 ml-1" />}
            </>
          ) : (
            'Rate'
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate & Review</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{title}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Stars */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">How would you rate this?</p>
            <div className="flex justify-center">
              {renderStars(selectedRating, true, 'lg')}
            </div>
            {selectedRating > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedRating === 1 && "Terrible"}
                {selectedRating === 2 && "Poor"}
                {selectedRating === 3 && "Average"}
                {selectedRating === 4 && "Good"}
                {selectedRating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Quick Rating Buttons */}
          <div className="flex justify-center gap-2">
            <Button
              variant={selectedRating <= 2 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRating(1)}
              className="gap-1"
            >
              <ThumbsDown className="h-4 w-4" />
              Not for me
            </Button>
            <Button
              variant={selectedRating >= 4 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRating(5)}
              className="gap-1"
            >
              <ThumbsUp className="h-4 w-4" />
              Loved it
            </Button>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Write a review (optional)</label>
            <Textarea
              placeholder="Share your thoughts about this movie/show..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={selectedRating === 0 || ratingMutation.isPending}
            >
              {ratingMutation.isPending ? 'Saving...' : 'Save Rating'}
            </Button>
          </div>
        </div>

        {/* Existing Rating Info */}
        {existingRating && (
          <div className="bg-muted/50 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your previous rating:</span>
              <Badge variant="secondary">{existingRating.rating}/5</Badge>
            </div>
            {existingRating.review && (
              <p className="text-sm text-muted-foreground italic">
                "{existingRating.review}"
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
