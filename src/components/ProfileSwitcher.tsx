
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Users, User, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  is_child: boolean;
}

export const ProfileSwitcher = () => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Validate the saved profile still exists
        if (profiles.some(p => p.id === parsed.id)) {
          setCurrentProfile(parsed);
        } else if (profiles.length > 0) {
          // Fallback to first profile if saved one doesn't exist
          setCurrentProfile(profiles[0]);
          localStorage.setItem('selectedProfile', JSON.stringify(profiles[0]));
        }
      } catch (error) {
        console.error('Error parsing saved profile:', error);
        if (profiles.length > 0) {
          setCurrentProfile(profiles[0]);
          localStorage.setItem('selectedProfile', JSON.stringify(profiles[0]));
        }
      }
    } else if (profiles.length > 0) {
      setCurrentProfile(profiles[0]);
      localStorage.setItem('selectedProfile', JSON.stringify(profiles[0]));
    }
  }, [profiles]);

  const handleProfileSwitch = (profile: UserProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    toast({
      title: "Profile switched",
      description: `Now using ${profile.name}'s profile`,
    });
    window.location.reload();
  };

  const handleManageProfiles = () => {
    navigate('/profiles');
  };

  const renderProfileAvatar = (avatar: string, name: string) => {
    if (avatar && avatar !== '👤') {
      return (
        <img 
          src={avatar} 
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">${name.charAt(0).toUpperCase()}</div>`;
          }}
        />
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Button variant="ghost" disabled className="text-white opacity-50">
        <LoadingSpinner size="sm" />
        <span className="hidden sm:inline ml-2">Loading...</span>
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="ghost" onClick={handleManageProfiles} className="text-red-400 hover:bg-red-400/10">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Profile Error</span>
      </Button>
    );
  }

  if (!currentProfile && profiles.length === 0) {
    return (
      <Button variant="ghost" onClick={handleManageProfiles} className="text-white hover:bg-white/10">
        <Users className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Create Profile</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-transparent p-0">
              {currentProfile ? renderProfileAvatar(currentProfile.avatar, currentProfile.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline font-medium">{currentProfile?.name || 'Select Profile'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-black/95 backdrop-blur-sm border-gray-700">
        <div className="p-2">
          <div className="text-xs text-gray-400 mb-2 font-medium">Switch Profile</div>
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleProfileSwitch(profile)}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {renderProfileAvatar(profile.avatar, profile.name)}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-white truncate">{profile.name}</span>
                {profile.is_child && (
                  <span className="text-xs text-blue-400">Kids Profile</span>
                )}
              </div>
              {currentProfile?.id === profile.id && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <div className="border-t border-gray-700 mt-2 pt-2">
            <DropdownMenuItem onClick={handleManageProfiles} className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">Manage Profiles</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
