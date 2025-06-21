import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Play, Copy, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SimpleWatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: "movie" | "tv";
}

export const SimpleWatchParty: React.FC<SimpleWatchPartyProps> = ({
  movieId,
  movieTitle,
  movieType,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join" | "party">("create");
  const [partyCode, setPartyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [participants] = useState([
    { id: "1", name: user?.username || "You", isHost: true },
  ]);

  const generatePartyCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateParty = () => {
    const code = generatePartyCode();
    setPartyCode(code);
    setMode("party");
    toast.success(`Watch party created! Code: ${code}`);
  };

  const handleJoinParty = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a party code");
      return;
    }

    setPartyCode(joinCode.toUpperCase());
    setMode("party");
    toast.success("Joined watch party!");
  };

  const copyInviteLink = () => {
    const inviteText = `Join my watch party for "${movieTitle}"! Code: ${partyCode}\n\nWatch together at: ${window.location.origin}/watch-party/${partyCode}`;
    navigator.clipboard.writeText(inviteText);
    toast.success("Invite copied to clipboard!");
  };

  const shareParty = async () => {
    const shareData = {
      title: `Join my watch party for ${movieTitle}`,
      text: `Watch ${movieTitle} together! Party code: ${partyCode}`,
      url: `${window.location.origin}/watch-party/${partyCode}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyInviteLink();
      }
    } catch (error) {
      copyInviteLink();
    }
  };

  const startWatching = () => {
    // Simulate starting the movie
    toast.success("Starting movie... (Demo mode)");
  };

  if (mode === "party") {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{movieTitle}</h1>
              <p className="text-gray-400">Party Code: {partyCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={shareParty} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                Leave
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Video Area */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-40 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-16 w-16 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{movieTitle}</h3>
              <p className="text-gray-400 mb-4">Ready to start watching</p>
              <Button
                onClick={startWatching}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Movie
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-900 border-l border-gray-800">
            {/* Participants */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {participant.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm">{participant.name}</span>
                    {participant.isHost && (
                      <span className="text-xs bg-yellow-600 px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Section */}
            <div className="p-4">
              <h3 className="font-semibold mb-3">Invite Friends</h3>
              <div className="space-y-2">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Party Code</p>
                  <p className="font-mono text-lg">{partyCode}</p>
                </div>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Watch Party</CardTitle>
          <p className="text-gray-400">{movieTitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "create" && (
            <div className="space-y-4">
              <Button
                onClick={handleCreateParty}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Create Watch Party
              </Button>

              <div className="text-center">
                <Button
                  onClick={() => setMode("join")}
                  variant="link"
                  className="text-gray-400"
                >
                  Have a party code? Join instead
                </Button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter 6-character party code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-gray-800 border-gray-700 text-white text-center text-lg tracking-widest font-mono"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleJoinParty}
                  disabled={!joinCode.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  Join Party
                </Button>

                <Button
                  onClick={() => setMode("create")}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300"
                >
                  Back to Create
                </Button>
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="text-gray-400"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleWatchParty;
