
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

// Dicebear avatar styles and seeds
const avatarStyles = ['avataaars', 'big-smile', 'bottts', 'fun-emoji', 'personas'];
const avatarSeeds = [
  'Alex', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 
  'James', 'Isabella', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Mason',
  'Mia', 'Ethan', 'Harper', 'Alexander', 'Evelyn', 'Henry', 'Abigail',
  'Jacob', 'Emily', 'Michael', 'Elizabeth', 'Daniel', 'Sofia', 'Logan', 'Avery'
];

const generateDicebearUrl = (style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar = generateDicebearUrl('avataaars', 'Alex'),
  onAvatarSelect,
  className = ''
}) => {
  const [currentStyle, setCurrentStyle] = useState('avataaars');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const currentAvatars = avatarSeeds.map(seed => generateDicebearUrl(currentStyle, seed));

  const handleImageError = (avatar: string) => {
    setImageErrors(prev => new Set(prev.add(avatar)));
  };

  const generateRandomAvatar = () => {
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = generateDicebearUrl(randomStyle, randomSeed);
    onAvatarSelect(newAvatar);
  };

  const renderAvatar = (avatar: string, index: number) => {
    const isSelected = selectedAvatar === avatar;
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
        {hasError ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
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
            variant="outline"
            size="sm"
            onClick={generateRandomAvatar}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Random
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {avatarStyles.map(style => (
          <Button
            key={style}
            variant={currentStyle === style ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStyle(style)}
            className="capitalize"
          >
            {style.replace('-', ' ')}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {currentAvatars.map(renderAvatar)}
      </div>
    </div>
  );
};
