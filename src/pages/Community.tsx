import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, TrendingUp, Film } from "lucide-react";
import { FullFunctionalCommunityFeed } from "@/components/community/FullFunctionalCommunityFeed";
import { CommunityErrorBoundary } from "@/components/community/CommunityErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { user } = useAuth();

  const filters = [
    { id: "all", label: "All Posts", icon: Users },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "movies", label: "Movies", icon: Film },
  ];

  return (
    <CommunityErrorBoundary>
      <div className="min-h-screen bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Community</h1>
                  <p className="text-gray-400 text-sm">
                    Share your movie experiences with fellow cinephiles
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.id)}
                      className={`text-sm ${
                        activeFilter === filter.id
                          ? "bg-red-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Auth Message */}
        {!user && (
          <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3">
            <div className="container mx-auto text-center">
              <p className="text-sm text-gray-400 mb-2">
                Join the conversation! Sign in to create posts and interact with
                the community
              </p>
              <Link to="/auth">
                <Button size="sm" variant="outline" className="text-xs">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="container mx-auto px-4 py-6">
          <FullFunctionalCommunityFeed
            searchQuery={searchQuery}
            filter={activeFilter}
          />
        </div>
      </div>
    </CommunityErrorBoundary>
  );
};

export default Community;
