
import React from 'react';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
}

const avatarOptions = [
  'https://api.dicebear.com/8.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Sam&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Jordan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Casey&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Riley&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Morgan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Avery&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  'https://api.dicebear.com/8.x/notionists/svg?seed=Parker&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary">
          <img
            src={selectedAvatar}
            alt="Selected avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {avatarOptions.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200 ${
              selectedAvatar === avatar
                ? 'border-primary scale-110 shadow-lg'
                : 'border-gray-300 hover:border-primary hover:scale-105'
            }`}
          >
            <img
              src={avatar}
              alt={`Avatar option ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
