
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const avatarStyles = ['avataaars', 'big-smile', 'bottts', 'fun-emoji', 'personas'];
const avatarSeeds = [
  'Alex', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia',
  'James', 'Isabella', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Mason',
  'Mia', 'Ethan', 'Harper', 'Alexander', 'Evelyn', 'Henry', 'Abigail',
  'Jacob', 'Emily', 'Michael', 'Elizabeth', 'Daniel', 'Sofia', 'Logan', 'Avery'
];

const generateDicebearUrl = (style: string, seed: string) =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect,
  className = ''
}) => {
  const [currentStyle, setCurrentStyle] = useState('avataaars');

  const currentAvatars = avatarSeeds.map(seed => generateDicebearUrl(currentStyle, seed));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2 flex-wrap mb-2">
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
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {currentAvatars.map((avatar, i) => (
          <button
            key={`${avatar}-${i}`}
            className={`w-14 h-14 rounded-full flex items-center justify-center relative border focus:outline-none
              ${selectedAvatar === avatar ? 'ring-2 ring-blue-500 border-blue-700' : 'border-gray-400'}
            `}
            onClick={() => onAvatarSelect(avatar)}
            type="button"
          >
            <img src={avatar} alt="" className="w-full h-full object-cover rounded-full" />
            {selectedAvatar === avatar && (
              <span className="absolute top-0 right-0 mt-0.5 mr-0.5 bg-blue-500 rounded-full text-white text-xs p-0.5">
                <Check size={14} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
