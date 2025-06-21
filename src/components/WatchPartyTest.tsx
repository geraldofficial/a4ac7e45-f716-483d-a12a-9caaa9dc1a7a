import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { simpleWatchPartyService } from "@/services/simpleWatchParty";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const WatchPartyTest: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(
    simpleWatchPartyService.getAllSessions(),
  );
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const refreshSessions = () => {
    setSessions(simpleWatchPartyService.getAllSessions());
    addTestResult("Sessions refreshed");
  };

  const testCreateSession = () => {
    if (!user?.id) {
      addTestResult("❌ No user logged in");
      return;
    }

    try {
      const sessionId = simpleWatchPartyService.createSession(
        12345,
        "Test Movie",
        "movie",
        user.id,
      );
      addTestResult(`✅ Created session: ${sessionId}`);
      refreshSessions();
      toast.success(`Test session created: ${sessionId}`);
    } catch (error) {
      addTestResult(`❌ Failed to create session: ${error}`);
    }
  };

  const testJoinSession = (sessionId: string) => {
    if (!user?.id) {
      addTestResult("❌ No user logged in");
      return;
    }

    try {
      const session = simpleWatchPartyService.joinSession(
        sessionId,
        user.id + "_test",
      );
      if (session) {
        addTestResult(`✅ Joined session: ${sessionId}`);
        refreshSessions();
        toast.success(`Joined session: ${sessionId}`);
      } else {
        addTestResult(`❌ Failed to join session: ${sessionId}`);
      }
    } catch (error) {
      addTestResult(`❌ Join error: ${error}`);
    }
  };

  const clearAllSessions = () => {
    // Clear all sessions by creating a new service instance (hack for testing)
    sessions.forEach((session) => {
      if (user?.id) {
        simpleWatchPartyService.leaveSession(session.id, session.hostId);
      }
    });
    addTestResult("🧹 Attempted to clear all sessions");
    refreshSessions();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Watch Party Debug</h3>
        <p className="text-gray-400 text-sm">
          Active Sessions: {sessions.filter((s) => s.isActive).length}
        </p>
      </div>

      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          <Button onClick={testCreateSession} size="sm" className="w-full">
            Create Test Session
          </Button>
          <Button
            onClick={refreshSessions}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Refresh Sessions
          </Button>
          <Button
            onClick={clearAllSessions}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            Clear All
          </Button>
        </div>

        {sessions.length > 0 && (
          <div>
            <h4 className="text-white text-sm font-medium mb-2">
              Active Sessions:
            </h4>
            <div className="space-y-1">
              {sessions
                .filter((s) => s.isActive)
                .map((session) => (
                  <Card
                    key={session.id}
                    className="bg-gray-800 border-gray-600"
                  >
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-xs font-mono">
                            {session.id}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {session.movieTitle}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {session.participants.length} users
                          </Badge>
                        </div>
                        <Button
                          onClick={() => testJoinSession(session.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div>
            <h4 className="text-white text-sm font-medium mb-2">
              Test Results:
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {testResults.slice(-5).map((result, index) => (
                <p
                  key={index}
                  className="text-xs text-gray-300 font-mono bg-gray-800 p-1 rounded"
                >
                  {result}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPartyTest;
