
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

// Apple-style Memoji and professional avatars
const defaultAvatars = [
  'https://api.dicebear.com/8.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Emma&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Liam&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Olivia&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Noah&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Ava&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=William&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Sophia&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=James&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Isabella&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Benjamin&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Charlotte&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Lucas&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Amelia&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Mason&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Harper&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Ethan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Evelyn&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Alexander&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Abigail&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Michael&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Emily&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Daniel&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Madison&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar = defaultAvatars[0],
  onAvatarSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-xl font-bold text-foreground text-center">Choose Your Avatar</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {defaultAvatars.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`
              relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-3 flex items-center justify-center
              transition-all duration-300 hover:scale-110 overflow-hidden backdrop-blur-2xl
              shadow-lg hover:shadow-2xl
              ${selectedAvatar === avatar 
                ? 'border-primary bg-primary/10 shadow-primary/25 scale-110' 
                : 'border-border/50 hover:border-primary/50 bg-background/20 hover:bg-background/30'
              }
            `}
          >
            <img 
              src={avatar} 
              alt={`Avatar ${index + 1}`}
              className="w-full h-full object-cover rounded-xl"
            />
            {selectedAvatar === avatar && (
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-3 border-background shadow-lg animate-bounce-in">
                <Check className="w-4 h-4 text-primary-foreground font-bold" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
