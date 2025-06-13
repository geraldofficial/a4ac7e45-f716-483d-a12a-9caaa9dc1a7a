
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

const defaultAvatars = [
  '👤', '🧑', '👨', '👩', '🧑‍🎨', '👨‍💻', '👩‍💻', '🧑‍🎓',
  '👨‍🎓', '👩‍🎓', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧙‍♂️', '🧙‍♀️', '🦸‍♂️',
  '🦸‍♀️', '🧝‍♂️', '🧝‍♀️', '🧞‍♂️', '🧞‍♀️', '🧛‍♂️', '🧛‍♀️', '🧚‍♂️'
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar = '👤',
  onAvatarSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground">Choose Your Avatar</h3>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
        {defaultAvatars.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`
              relative w-12 h-12 rounded-full border-2 flex items-center justify-center
              text-2xl transition-all duration-200 hover:scale-110
              ${selectedAvatar === avatar 
                ? 'border-primary bg-primary/20' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            {avatar}
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
