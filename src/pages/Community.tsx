
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

const Community = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePostCreated = (newPost: any) => {
    // Handle the new post creation
    console.log('New post created:', newPost);
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 md:pb-4">
      <div className="container mx-auto px-3 md:px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Community</h1>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 md:gap-2 h-9 px-3">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <CreatePost 
                  onClose={() => setShowCreatePost(false)} 
                  onPostCreated={handlePostCreated}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6 h-9">
            <TabsTrigger value="feed" className="text-xs md:text-sm">Feed</TabsTrigger>
            <TabsTrigger value="stories" className="text-xs md:text-sm">Stories</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs md:text-sm">Messages</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 md:space-y-6">
            <CommunityFeed searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="stories" className="space-y-4 md:space-y-6">
            <StoryViewer />
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 md:space-y-6">
            <DirectMessages />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 md:space-y-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
