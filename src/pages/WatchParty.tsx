import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Play, ArrowLeft } from "lucide-react";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";
import {
  enhancedDatabaseWatchPartyService,
  EnhancedWatchPartySession,
} from "@/services/enhancedDatabaseWatchParty";
import { FullyFunctionalWatchParty } from "@/components/FullyFunctionalWatchParty";

const WatchParty: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [session, setSession] = useState<EnhancedWatchPartySession | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!partyId) {
      navigate("/");
      return;
    }
    fetchSessionDetails();
  }, [partyId, user]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);

      // First check if session exists
      const exists =
        await enhancedDatabaseWatchPartyService.sessionExists(partyId);
      if (!exists) {
        toast.error("Watch party not found");
        navigate("/community");
        return;
      }

      // If user is authenticated, try to join the session
      if (user) {
        const sessionData =
          await enhancedDatabaseWatchPartyService.joinSession(partyId);
        if (sessionData) {
          setSession(sessionData);
          setHasJoined(true);
        }
      }
    } catch (error) {
      console.error("Error fetching session:", formatError(error));
      toast.error("Failed to load watch party");
      navigate("/community");
    } finally {
      setLoading(false);
    }
  };

  const joinParty = async () => {
    if (!user || !partyId) return;

    try {
      setJoining(true);
      const sessionData =
        await enhancedDatabaseWatchPartyService.joinSession(partyId);
      if (sessionData) {
        setSession(sessionData);
        setHasJoined(true);
        toast.success("Joined watch party!");
      }
    } catch (error) {
      toast.error(`Failed to join party: ${formatError(error)}`);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = () => {
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

  if (!session) {
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

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-lg border-gray-800 bg-gray-900">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="text-white text-xl">
                Join Watch Party
              </CardTitle>
              <p className="text-gray-400 mt-2">
                You're invited to watch{" "}
                <span className="text-white font-medium">
                  {session.movie_title}
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Party Code</span>
                <span className="text-green-400 font-mono text-lg">
                  {session.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-300">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Participants</span>
                <span className="text-gray-300">
                  {session.participants.length}
                </span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Button
                onClick={joinParty}
                disabled={joining}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                {joining ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                {joining ? "Joining..." : "Join Watch Party"}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/community")}
                className="w-full border-gray-700 text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Once joined, show the full functional watch party component
  return (
    <FullyFunctionalWatchParty
      movieId={session.movie_id}
      movieTitle={session.movie_title}
      movieType={session.movie_type}
      onClose={handleLeave}
    />
  );
};

export default WatchParty;
