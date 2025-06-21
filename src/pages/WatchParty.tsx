import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { perfectWatchPartyService } from "@/services/perfectWatchParty";
import PerfectWatchParty from "@/components/PerfectWatchParty";

const WatchParty: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);
  const [movieInfo, setMovieInfo] = useState<{
    id: number;
    title: string;
    type: "movie" | "tv";
  } | null>(null);

  useEffect(() => {
    if (!partyId) {
      navigate("/");
      return;
    }
    checkSession();
  }, [partyId]);

  const checkSession = async () => {
    try {
      setLoading(true);
      const exists = await perfectWatchPartyService.sessionExists(partyId!);

      if (!exists) {
        toast.error("Watch party not found or expired");
        navigate("/community");
        return;
      }

      // Get session details to extract movie info
      const session = await perfectWatchPartyService.getSession(partyId!);
      if (session) {
        setSessionExists(true);
        setMovieInfo({
          id: session.movie_id,
          title: session.movie_title,
          type: session.movie_type,
        });
      }
    } catch (error) {
      console.error("Error checking session:", error);
      toast.error("Failed to load watch party");
      navigate("/community");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/community");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading watch party...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Sign In Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">
              You need to sign in to join this watch party.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/auth")}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full border-gray-700 text-gray-300"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionExists || !movieInfo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Party Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">
              This watch party doesn't exist or has ended.
            </p>
            <Button
              onClick={() => navigate("/community")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the perfect watch party component
  return (
    <PerfectWatchParty
      movieId={movieInfo.id}
      movieTitle={movieInfo.title}
      movieType={movieInfo.type}
      sessionId={partyId}
      onClose={handleClose}
    />
  );
};

export default WatchParty;
