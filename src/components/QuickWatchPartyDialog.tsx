import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Users, Play, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { simpleWatchPartyService } from "@/services/simpleWatchParty";
import { toast } from "sonner";

interface QuickWatchPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId?: number;
  movieTitle?: string;
  movieType?: "movie" | "tv";
}

export const QuickWatchPartyDialog: React.FC<QuickWatchPartyDialogProps> = ({
  open,
  onOpenChange,
  movieId,
  movieTitle,
  movieType = "movie",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const createWatchParty = async () => {
    if (!user) {
      toast.error("Please sign in to create a watch party");
      return;
    }

    if (!movieId || !movieTitle) {
      // Redirect to browse to select a movie
      onOpenChange(false);
      navigate("/browse");
      return;
    }

    setCreating(true);
    try {
      const sessionId = simpleWatchPartyService.createSession(
        movieId,
        movieTitle,
        movieType,
        user.id,
      );

      onOpenChange(false);
      // Navigate to movie detail page and show watch party
      navigate(`/movie/${movieId}?watch_party=${sessionId}`);
      toast.success(`Watch party created! Code: ${sessionId}`);
    } catch (error) {
      console.error("Error creating watch party:", error);
      toast.error("Failed to create watch party");
    } finally {
      setCreating(false);
    }
  };

  const joinWatchParty = async () => {
    if (!user) {
      toast.error("Please sign in to join a watch party");
      return;
    }

    if (!joinCode.trim()) {
      toast.error("Please enter a party code");
      return;
    }

    setJoining(true);
    try {
      const exists = simpleWatchPartyService.sessionExists(
        joinCode.trim().toUpperCase(),
      );

      if (!exists) {
        toast.error("Watch party not found or expired");
        return;
      }

      const session = simpleWatchPartyService.getSession(
        joinCode.trim().toUpperCase(),
      );
      if (session) {
        onOpenChange(false);
        // Navigate to the movie and join the party
        navigate(
          `/movie/${session.movieId}?join_party=${joinCode.trim().toUpperCase()}`,
        );
        toast.success("Joining watch party!");
      }
    } catch (error) {
      console.error("Error joining watch party:", error);
      toast.error("Failed to join watch party");
    } finally {
      setJoining(false);
    }
  };

  const handleBrowseMovies = () => {
    onOpenChange(false);
    navigate("/browse");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Watch Party</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new party or join an existing one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Section */}
          <div className="space-y-4">
            <Label className="text-white font-medium">Create New Party</Label>

            {movieId && movieTitle ? (
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-600 rounded p-2">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {movieTitle}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {movieType === "movie" ? "Movie" : "TV Show"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-gray-700 rounded-lg">
                <Search className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">No movie selected</p>
                <Button
                  variant="link"
                  onClick={handleBrowseMovies}
                  className="text-red-400 p-0 h-auto"
                >
                  Browse movies to watch
                </Button>
              </div>
            )}

            <Button
              onClick={createWatchParty}
              disabled={creating || !movieId || !movieTitle}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Party
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">Or</span>
            </div>
          </div>

          {/* Join Section */}
          <div className="space-y-4">
            <Label className="text-white font-medium">
              Join Existing Party
            </Label>

            <div className="space-y-2">
              <Input
                placeholder="Enter 6-character party code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="bg-gray-800 border-gray-700 text-white text-center text-lg tracking-widest font-mono"
              />

              <Button
                onClick={joinWatchParty}
                disabled={!joinCode.trim() || joining}
                variant="outline"
                className="w-full border-gray-700 text-gray-300"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2" />
                    Joining...
                  </>
                ) : (
                  "Join Party"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickWatchPartyDialog;
