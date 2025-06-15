
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Bookmark, Heart, MessageSquare, Share2, Settings, Edit } from 'lucide-react';

interface UserPost {
  id: string;
  image: string;
  likes: number;
  comments: number;
  type: 'image' | 'video';
}

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('posts');

  const userPosts: UserPost[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=300&fit=crop',
      likes: 42,
      comments: 8,
      type: 'image'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1489599316546-1bb930b5bf29?w=300&h=300&fit=crop',
      likes: 28,
      comments: 5,
      type: 'image'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=300&fit=crop',
      likes: 67,
      comments: 12,
      type: 'video'
    }
  ];

  const bookmarkedPosts: UserPost[] = [
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=300&fit=crop',
      likes: 89,
      comments: 15,
      type: 'image'
    }
  ];

  const stats = {
    posts: userPosts.length,
    followers: 1248,
    following: 892
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarFallback>
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-4xl">
                  U
                </div>
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">Your Name</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{stats.posts}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{stats.following.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="font-semibold">Movie Enthusiast 🎬</h2>
                <p className="text-muted-foreground text-sm">
                  Passionate about cinema and storytelling. Love discussing movies and TV shows!
                </p>
                <p className="text-muted-foreground text-sm">
                  📍 Los Angeles, CA
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {userPosts.map(post => (
                <div key={post.id} className="relative aspect-square group cursor-pointer">
                  <img 
                    src={post.image} 
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5 fill-current" />
                        <span className="font-semibold">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-5 w-5 fill-current" />
                        <span className="font-semibold">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Share your first post to get started!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {bookmarkedPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {bookmarkedPosts.map(post => (
                <div key={post.id} className="relative aspect-square group cursor-pointer">
                  <img 
                    src={post.image} 
                    alt="Saved post"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5 fill-current" />
                        <span className="font-semibold">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-5 w-5 fill-current" />
                        <span className="font-semibold">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No saved posts</h3>
              <p className="text-muted-foreground">Save posts you like to see them here!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
