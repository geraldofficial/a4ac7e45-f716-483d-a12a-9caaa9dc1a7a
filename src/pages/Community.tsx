import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FullFunctionalCommunityFeed } from "@/components/community/FullFunctionalCommunityFeed";
import { CommunityErrorBoundary } from "@/components/community/CommunityErrorBoundary";
import { useAuthState } from "@/hooks/useAuthState";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthState();

  return (
    <CommunityErrorBoundary>
      <div className="min-h-screen bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Community</h1>
                <p className="text-gray-400 text-sm">
                  Share your movie experiences
                </p>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auth Message */}
        {!user && (
          <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3">
            <p className="text-sm text-gray-400 text-center">
              Sign in to create posts and interact with the community
            </p>
          </div>
        )}

        {/* Feed */}
        <div className="container mx-auto px-4 py-6">
          <CommunityFeed />
        </div>
      </div>
    </CommunityErrorBoundary>
  );
};

export default Community;
