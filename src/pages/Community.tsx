
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { MinimalCommunityFeed } from '@/components/community/MinimalCommunityFeed';
import { CommunityErrorBoundary } from '@/components/community/CommunityErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <CommunityErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Community</h1>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auth Message */}
        {!user && (
          <div className="bg-muted/30 border-b px-4 py-3">
            <p className="text-sm text-muted-foreground text-center">
              Sign in to create posts and interact with the community
            </p>
          </div>
        )}

        {/* Feed */}
        <MinimalCommunityFeed searchQuery={searchQuery} />
      </div>
    </CommunityErrorBoundary>
  );
};

export default Community;
