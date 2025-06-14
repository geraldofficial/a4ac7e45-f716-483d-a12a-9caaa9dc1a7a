
import React from 'react';
import { Film } from 'lucide-react';

export const FlickPickLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
        <Film className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold text-white">FlickPick</span>
    </div>
  );
};
