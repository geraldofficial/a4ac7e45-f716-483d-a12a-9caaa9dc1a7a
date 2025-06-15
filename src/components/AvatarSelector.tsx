
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

// Emoji avatars as fallback and primary option
const emojiAvatars = [
  '👤', '👨', '👩', '🧑', '👦', '👧', '👶', '🧓', '👴', '👵',
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️', '👨‍🚀', '👩‍🚀',
  '🧑‍🎨', '👨‍🎨', '👩‍🎨', '🧑‍🍳', '👨‍🍳', '👩‍🍳'
];

// Alternative image avatars with better reliability
const imageAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=William',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte'
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar = emojiAvatars[0],
  onAvatarSelect,
  className = ''
}) => {
  const [useEmojis, setUseEmojis] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const currentAvatars = useEmojis ? emojiAvatars : imageAvatars;

  const handleImageError = (avatar: string) => {
    setImageErrors(prev => new Set(prev.add(avatar)));
  };

  const renderAvatar = (avatar: string, index: number) => {
    const isSelected = selectedAvatar === avatar;
    const isEmoji = emojiAvatars.includes(avatar);
    const hasError = imageErrors.has(avatar);

    return (
      <button
        key={`${avatar}-${index}`}
        onClick={() => onAvatarSelect(avatar)}
        className={`
          relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-3 flex items-center justify-center
          transition-all duration-300 hover:scale-110 overflow-hidden backdrop-blur-2xl
          shadow-lg hover:shadow-2xl
          ${isSelected 
            ? 'border-primary bg-primary/10 shadow-primary/25 scale-110' 
            : 'border-border/50 hover:border-primary/50 bg-background/20 hover:bg-background/30'
          }
        `}
      >
        {isEmoji || hasError ? (
          <span className="text-2xl">{isEmoji ? avatar : '👤'}</span>
        ) : (
          <img 
            src={avatar} 
            alt={`Avatar ${index + 1}`}
            className="w-full h-full object-cover rounded-xl"
            onError={() => handleImageError(avatar)}
          />
        )}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-3 border-background shadow-lg animate-bounce-in">
            <Check className="w-4 h-4 text-primary-foreground font-bold" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Choose Your Avatar</h3>
        <div className="flex gap-2">
          <Button
            variant={useEmojis ? "default" : "outline"}
            size="sm"
            onClick={() => setUseEmojis(true)}
          >
            😊 Emojis
          </Button>
          <Button
            variant={!useEmojis ? "default" : "outline"}
            size="sm"
            onClick={() => setUseEmojis(false)}
          >
            🖼️ Images
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {currentAvatars.map(renderAvatar)}
      </div>
    </div>
  );
};
