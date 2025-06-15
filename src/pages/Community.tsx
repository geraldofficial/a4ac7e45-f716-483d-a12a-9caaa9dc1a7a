
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { CreatePost } from '@/components/community/CreatePost';
import { StoryViewer } from '@/components/community/StoryViewer';
import { UserProfile } from '@/components/community/UserProfile';
import { DirectMessages } from '@/components/community/DirectMessages';
import { CommunityErrorBoundary } from '@/components/community/CommunityErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';

const Community = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const handlePostCreated = (newPost: any) => {
    console.log('New post created:', newPost);
    setShowCreatePost(false);
  };

  return (
    <CommunityErrorBoundary>
      <div className="min-h-screen bg-background pt-16 pb-20 md:pb-4">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Community</h1>
              <p className="text-muted-foreground text-sm">
                Connect with movie enthusiasts and share your thoughts
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts and users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              {user && (
                <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 h-10">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Create</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CreatePost 
                      onClose={() => setShowCreatePost(false)} 
                      onPostCreated={handlePostCreated}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Auth Message */}
          {!user && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground text-center">
                Sign in to create posts, like content, and interact with the community.
              </p>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 h-10">
              <TabsTrigger value="feed" className="text-sm">Feed</TabsTrigger>
              <TabsTrigger value="stories" className="text-sm">Stories</TabsTrigger>
              <TabsTrigger value="messages" className="text-sm">Messages</TabsTrigger>
              <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <CommunityFeed searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="stories" className="space-y-6">
              <StoryViewer />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              {user ? (
                <DirectMessages />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Sign in to access direct messages.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              {user ? (
                <UserProfile />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Sign in to view your profile.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CommunityErrorBoundary>
  );
};

export default Community;
