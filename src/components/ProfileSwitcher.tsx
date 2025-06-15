
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  is_child: boolean;
}

export const ProfileSwitcher = () => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      try {
        setCurrentProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    } else if (profiles.length > 0) {
      // Auto-select first profile if none selected
      setCurrentProfile(profiles[0]);
      localStorage.setItem('selectedProfile', JSON.stringify(profiles[0]));
    }
  }, [profiles]);

  const handleProfileSwitch = (profile: UserProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    // Refresh the page to update content based on new profile
    window.location.reload();
  };

  const handleManageProfiles = () => {
    navigate('/profiles');
  };

  if (!currentProfile && profiles.length === 0) {
    return (
      <Button variant="ghost" onClick={handleManageProfiles} className="text-white">
        <Users className="h-4 w-4 mr-2" />
        Create Profile
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {currentProfile?.avatar || '👤'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{currentProfile?.name || 'Select Profile'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {profiles.map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            onClick={() => handleProfileSwitch(profile)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{profile.avatar}</span>
            <div className="flex flex-col">
              <span>{profile.name}</span>
              {profile.is_child && (
                <span className="text-xs text-muted-foreground">Kids Profile</span>
              )}
            </div>
            {currentProfile?.id === profile.id && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={handleManageProfiles} className="border-t mt-1 pt-2">
          <Users className="h-4 w-4 mr-2" />
          Manage Profiles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
