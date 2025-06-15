
import React from 'react';
import { CreatePostCard } from './CreatePostCard';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Create Post</h2>
      <CreatePostCard />
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
};
