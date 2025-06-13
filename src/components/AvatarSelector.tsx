
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

const defaultAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=William',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Harper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Abigail',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar = defaultAvatars[0],
  onAvatarSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-xl font-bold text-white text-center">Choose Your Avatar</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {defaultAvatars.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`
              relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex items-center justify-center
              transition-all duration-300 hover:scale-110 overflow-hidden backdrop-blur-sm
              shadow-lg hover:shadow-xl
              ${selectedAvatar === avatar 
                ? 'border-purple-400 bg-purple-500/20 shadow-purple-500/25' 
                : 'border-white/30 hover:border-purple-400/50 bg-white/10 hover:bg-white/15'
              }
            `}
          >
            <img 
              src={avatar} 
              alt={`Avatar ${index + 1}`}
              className="w-full h-full object-cover rounded-full"
            />
            {selectedAvatar === avatar && (
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg animate-scale-in">
                <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
