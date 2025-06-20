import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WatchPartyRoom } from "@/components/watchparty/enhanced/WatchPartyRoom";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Play, ArrowLeft } from "lucide-react";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";

interface WatchParty {
  id: string;
  movie_title: string;
  movie_poster?: string;
  movie_src: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

const WatchParty: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthState();

  const [party, setParty] = useState<WatchParty | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!partyId) {
      navigate("/");
      return;
    }
    fetchPartyDetails();
  }, [partyId]);

  const fetchPartyDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("watch_parties")
        .select("*")
        .eq("id", partyId)
        .single();

      if (error) throw error;
      setParty(data);

      // Check if user is already a participant
      if (user) {
        const { data: participantData } = await supabase
          .from("watch_party_participants")
          .select("id")
          .eq("watch_party_id", partyId)
          .eq("user_id", user.id)
          .single();

        setHasJoined(!!participantData);
      }
    } catch (error) {
      console.error("Error fetching party:", formatError(error));
      toast.error("Failed to load watch party");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const joinParty = async () => {
    if (!user || !party) return;

    try {
      setJoining(true);

      const { error } = await supabase.from("watch_party_participants").insert({
        watch_party_id: party.id,
        user_id: user.id,
        is_host: false,
      });

      if (error) throw error;
      setHasJoined(true);
      toast.success("Joined watch party!");
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

  if (!party) {
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
              {party.movie_poster && (
                <img
                  src={party.movie_poster}
                  alt={party.movie_title}
                  className="w-24 h-36 object-cover rounded-lg mx-auto mb-4"
                />
              )}
              <CardTitle className="text-white text-xl">
                Join Watch Party
              </CardTitle>
              <p className="text-gray-400 mt-2">
                You're invited to watch{" "}
                <span className="text-white font-medium">
                  {party.movie_title}
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Party Status</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-300">
                  {new Date(party.created_at).toLocaleDateString()}
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

  return (
    <WatchPartyRoom
      partyId={party.id}
      movieSrc={party.movie_src}
      movieTitle={party.movie_title}
      moviePoster={party.movie_poster}
      onLeave={handleLeave}
    />
  );
};

export default WatchParty;
