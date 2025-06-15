
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileDisplayProps {
  className?: string;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  // Get current profile from localStorage
  const getCurrentProfile = () => {
    try {
      const savedProfile = localStorage.getItem('selectedProfile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch {
      return null;
    }
  };

  const currentProfile = getCurrentProfile();

  const handleProfileClick = () => {
    navigate('/profiles');
  };

  if (!currentProfile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleProfileClick}
        className={`flex items-center gap-2 ${className}`}
      >
        <User className="h-4 w-4" />
        <span className="hidden md:inline">Select Profile</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleProfileClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20">
        <img 
          src={currentProfile.avatar} 
          alt={currentProfile.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentProfile.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
          }}
        />
      </div>
      <span className="hidden md:inline truncate max-w-20">{currentProfile.name}</span>
    </Button>
  );
};
