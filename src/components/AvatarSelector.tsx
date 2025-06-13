
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
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground">Choose Your Avatar</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {defaultAvatars.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`
              relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center
              transition-all duration-200 hover:scale-110 overflow-hidden
              ${selectedAvatar === avatar 
                ? 'border-primary bg-primary/20' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <img 
              src={avatar} 
              alt={`Avatar ${index + 1}`}
              className="w-full h-full object-cover rounded-full"
            />
            {selectedAvatar === avatar && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
