
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Play, X } from 'lucide-react';

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  media: string;
  type: 'image' | 'video';
  createdAt: Date;
  viewed: boolean;
}

export const StoryViewer: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      user: {
        name: 'Your Story',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      },
      media: '',
      type: 'image',
      createdAt: new Date(),
      viewed: false
    },
    {
      id: '2',
      user: {
        name: 'Sarah',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
      },
      media: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
      type: 'image',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      viewed: false
    },
    {
      id: '3',
      user: {
        name: 'John',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
      },
      media: 'https://images.unsplash.com/photo-1489599316546-1bb930b5bf29?w=400&h=600&fit=crop',
      type: 'image',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      viewed: true
    }
  ]);

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const openStory = (story: Story, index: number) => {
    setSelectedStory(story);
    setCurrentStoryIndex(index);
    
    // Mark as viewed
    setStories(prev => prev.map(s => 
      s.id === story.id ? { ...s, viewed: true } : s
    ));
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setSelectedStory(stories[nextIndex]);
      
      // Mark as viewed
      setStories(prev => prev.map(s => 
        s.id === stories[nextIndex].id ? { ...s, viewed: true } : s
      ));
    } else {
      setSelectedStory(null);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setSelectedStory(stories[prevIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stories Grid */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stories.map((story, index) => (
          <div key={story.id} className="flex-shrink-0">
            <button
              onClick={() => story.id === '1' ? console.log('Create story') : openStory(story, index)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`relative p-0.5 rounded-full ${
                story.viewed ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500'
              }`}>
                <div className="bg-background p-0.5 rounded-full">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>
                      {story.id === '1' ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                      ) : (
                        <img src={story.user.avatar} alt={story.user.name} className="w-full h-full object-cover" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-center max-w-16 truncate">{story.user.name}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Recent Stories */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Recent Stories</h3>
          <div className="space-y-3">
            {stories.slice(1).map(story => (
              <div key={story.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <img src={story.user.avatar} alt={story.user.name} className="w-full h-full object-cover" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{story.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {story.type === 'video' && (
                  <Play className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Story Viewer Modal */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-md h-[80vh] p-0 bg-black">
          {selectedStory && (
            <div className="relative w-full h-full">
              {/* Progress bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                {stories.slice(1).map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-0.5 rounded-full ${
                      index < currentStoryIndex ? 'bg-white' : 
                      index === currentStoryIndex ? 'bg-white/80' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 flex items-center gap-3 z-10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <img src={selectedStory.user.avatar} alt={selectedStory.user.name} className="w-full h-full object-cover" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium text-sm">{selectedStory.user.name}</span>
                <span className="text-white/70 text-xs ml-auto">
                  {new Date(selectedStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStory(null)}
                className="absolute top-8 right-4 z-10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Story content */}
              <div className="w-full h-full flex items-center justify-center">
                {selectedStory.type === 'image' ? (
                  <img src={selectedStory.media} alt="Story" className="max-w-full max-h-full object-contain" />
                ) : (
                  <video src={selectedStory.media} className="max-w-full max-h-full object-contain" autoPlay />
                )}
              </div>

              {/* Navigation areas */}
              <button
                onClick={prevStory}
                className="absolute left-0 top-0 w-1/2 h-full z-5"
                disabled={currentStoryIndex === 0}
              />
              <button
                onClick={nextStory}
                className="absolute right-0 top-0 w-1/2 h-full z-5"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
